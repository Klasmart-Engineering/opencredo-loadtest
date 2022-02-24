import * as env from '../utils/env.js';
import uuid from '../utils/uuid.js';
import aws4 from './aws4.js';
import { isRequestSuccessful } from './common.js'

import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';
import { sleep } from 'k6';

// Configure options
export const options = {
  ext: {
    loadimpact: {
      projectID: 3560234,
    }
  },
  scenarios: {
    uploads: {
      executor: 'per-vu-iterations',
      vus: __ENV.VUS,
      iterations: 1,
      maxDuration: '30m',
    }
  }
};

// Configure AWS access, region, and buckets
const AWS_CREDS = {
  accessKeyId: __ENV.AWS_ACCESS_KEY_ID,
  secretAccessKey: __ENV.AWS_SECRET_ACCESS_KEY,
  sessionToken: __ENV.AWS_SESSION_TOKEN
};
const inputBucket = __ENV.IN_BUCKET || 'kidsloop-global-loadtest-k8s-res';
const outputBucket = __ENV.OUT_BUCKET || inputBucket;
const region = __ENV.AWS_REGION || 'eu-west-2';

// Configure FPS API Endpoint. We cannot connect directly to redis, so we piggyback off of an HTTP service. Ideally this is a separate pod to the ones we're testing
const fpsEndpoint = __ENV.FPS_ENDPOINT || 'https://api.loadtest-k8s.kidsloop.live/v1/processor/file'

// Define the expected MD5 hash
const expectedMd5 = __ENV.EXPECTED_MD5 || 'dae47bdac1dd7eb2d983c22e8bdc6dc2';

// Define the max time to wait for a file to be processed
const maxWait = __ENV.MAX_WAIT || 1200; // Seconds (20 mins)

// Configure custom metrics
const success = new Rate('Successfully processed');
const timeTaken = new Trend('Time taken')

// Open test file and generate random name
const piiFile = open('./data/piiFile.jpg', 'b');
const fileName = `${uuid.v4()}.jpg`;

export default function main(data) {
  let signed;
  let response;

  const uploadData = http.file(piiFile, fileName)
  signed = aws4.sign(
    {
      method: 'PUT',
      host: `${inputBucket}.s3.${region}.amazonaws.com`,
      path: `fpstest/${fileName}`,
      signQuery: true,
    },
    AWS_CREDS,
  );

  console.log(`Uploading ${fileName}`)
  response = http.put(`https://${signed.host}/${signed.path}`,
    uploadData.data,
    { headers: signed.headers },
  );
  isRequestSuccessful(response);
  console.log(`Finished uploading ${fileName}`)

  const startTime = Date.parse(response.headers.Date);

  signed = aws4.sign(
    {
      method: 'HEAD',
      host: `${outputBucket}.s3.${region}.amazonaws.com`,
      path: `fpstest/${fileName}`,
    },
    AWS_CREDS,
  );

  // Small hack to toggle test condition for old & new implementation
  if (inputBucket == outputBucket) {
    http.post(fpsEndpoint,
      JSON.stringify({classify: 'attachment', file_name: `fpstest/${fileName}`}),
      { headers: { 'Content-Type': 'application/json' } }
    );
    isRequestSuccessful(response);
  }

  response = sleepWait(
    2,
    maxWait,
    () => http.request('HEAD',
      `https://${signed.host}/${signed.path}`,
      null,
      { headers: signed.headers }
    ),
    r => ((inputBucket == outputBucket && Date.parse(r.headers['Last-Modified']) > startTime) || (inputBucket != outputBucket && r.status == 200)) // If same bucket, test for date modified; if 2 buckets test for 200 response
  )

  if (response) {
    const finishTime = Date.parse(response.headers['Last-Modified']);
    timeTaken.add(finishTime - startTime);

    console.log('Checking MD5')
    if (response.headers.Etag.replace(/\"/g, '') == expectedMd5) {
      success.add(1);
    } else {
      success.add(0);
    }
  } else {
    success.add(0);
  }

}

function sleepWait(sleepStep, wait, fn, condition) {
  while (wait > 0) {
    sleep(sleepStep);
    let response = fn();
    wait = wait - sleepStep;
    if (condition(response)) return response;
  }
  return undefined;
}