/* eslint-disable no-undef */
import {
  Rate,
  Trend
} from 'k6/metrics';
import aws4                    from './aws4.js';
import http                    from 'k6/http';
import { isRequestSuccessful } from '../utils/common.js';
import { sleep }               from 'k6';
import uuid                    from '../utils/uuid.js';

/**
 * options for k6, adjusted to per VU iterations to match the testing scenario
 *
 * @constant
 * @type {object}
 * @memberof file-processing-service
 * @alias studentUploadsOptions
 */
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

/**
 * initialise aws credentials variable
 *
 * @constant
 * @type {object}
 * @memberof file-processing-service
 */
const AWS_CREDS = {
  accessKeyId: __ENV.AWS_ACCESS_KEY_ID,
  secretAccessKey: __ENV.AWS_SECRET_ACCESS_KEY,
  sessionToken: __ENV.AWS_SESSION_TOKEN
};

/**
 * The S3 bucket that the file will be uploaded to pre-processing
 *
 * @constant
 * @type {string}
 * @memberof file-processing-service
 * @default kidsloop-global-loadtest-k8s-res
 */
const inputBucket = __ENV.IN_BUCKET || 'kidsloop-global-loadtest-k8s-res';

/**
 * The S3 bucket that the file will be moved to post-processing
 *
 * @constant
 * @type {string}
 * @memberof file-processing-service
 * @default [inputBucket]{@link file-processing-service.inputBucket}
 */
const outputBucket = __ENV.OUT_BUCKET || inputBucket;

/**
 * The AWS Region the S3 buckets are in
 *
 * @constant
 * @type {string}
 * @memberof file-processing-service
 * @default eu-west-2
 */
const region = __ENV.AWS_REGION || 'eu-west-2';

/**
 * FPS API Endpoint. This is used as a piggyback to access a redis instance, should be a seperate pod to the one being tested
 *
 * @constant
 * @type {string}
 * @memberof file-processing-service
 * @default https://api.kidskube-loadtest.kidsloop.live/v1/processor/file
 */
const fpsEndpoint = __ENV.FPS_ENDPOINT || 'https://api.kidskube-loadtest.kidsloop.live/v1/processor/file';

/**
 * Expected MD5 hash of the file being processed
 *
 * @constant
 * @type {string}
 * @memberof file-processing-service
 * @default dae47bdac1dd7eb2d983c22e8bdc6dc2
 */
const expectedMd5 = __ENV.EXPECTED_MD5 || 'dae47bdac1dd7eb2d983c22e8bdc6dc2';

/**
 * Maximum wait time for a file to be processed in seconds
 *
 * @constant
 * @type {number}
 * @memberof file-processing-service
 * @default 1200 (20m)
 */
const maxWait = __ENV.MAX_WAIT || 1200; // Seconds (20 mins)

/**
 * initialises a successful processing rate k6 metric
 *
 * @constant
 * @memberof file-processing-service
 */
const success = new Rate('Successfully processed');

/**
 * initalises a time taken trend k6 metric
 *
 * @constant
 * @memberof file-processing-service
 */
const timeTaken = new Trend('Time taken');

/**
 * Open the test file to run through processing
 *
 * @constant
 * @memberof file-processing-service
 */
const piiFile = open('./data/piiFile.jpg', 'b');

/**
 * initalise a random file name
 *
 * @constant
 * @memberof file-processing-service
 */
const fileName = `${uuid.v4()}.jpg`;

/**
 * function for k6 to run the student uploads test
 *
 * @returns {void} Nothing
 * @memberof file-processing-service
 * @alias studentUploadsMain
 */
export default function main() {
  let signed;
  let response;

  const uploadData = http.file(piiFile, fileName);
  signed = aws4.sign(
    {
      method: 'PUT',
      host: `${inputBucket}.s3.${region}.amazonaws.com`,
      path: `fpstest/${fileName}`,
      signQuery: true,
    },
    AWS_CREDS,
  );

  console.log(`Uploading ${fileName}`);
  response = http.put(`https://${signed.host}/${signed.path}`,
    uploadData.data,
    { headers: signed.headers },
  );
  isRequestSuccessful(response);
  console.log(`Finished uploading ${fileName}`);

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
  );

  if (response) {
    const finishTime = Date.parse(response.headers['Last-Modified']);
    timeTaken.add(finishTime - startTime);

    console.log('Checking MD5');
    if (response.headers.Etag.replace(/\"/g, '') == expectedMd5) {
      success.add(1);
    } else {
      success.add(0);
    }
  } else {
    success.add(0);
  }
}

/**
 * function that loops for a configurable wait time and checks for successful processing of a file
 *
 * @param {number} sleepStep - length of time to sleep in between checks
 * @param {number} wait - how long to wait in total for function to complete
 * @param {Function} fn - a k6/http request to run
 * @param {Function} condition - a function that checks the validity of the response
 * @returns {(object|undefined)} either a k6/http response object or undefined
 * @memberof file-processing-service
 */
function sleepWait(sleepStep, wait, fn, condition) {
  while (wait > 0) {
    sleep(sleepStep);
    let response = fn();
    wait = wait - sleepStep;
    if (condition(response)) return response;
  }
  return undefined;
}