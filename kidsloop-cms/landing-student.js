import { loginSetup } from '../utils/setup.js'
import { studentTest } from './functions.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<2000'] // 95% of the iteration duration below 2s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        mumbaiDistribution: {
          loadZone: 'amazon:in:mumbai',
          percent: 50
        },
        portlandDistribution: {
          loadZone: 'amazon:us:portland',
          percent: 50
        },
      }
    }
  },
}

const APP_URL = __ENV.APP_URL
const CMS_PREFIX = __ENV.CMS_PREFIX
const USERNAME = __ENV.USERNAME

const TESTVAL = __ENV.test

export function setup() {
  return loginSetup(APP_URL, USERNAME, 'dev');
}

export default function main(data) {

  const cmsUrl = `https://${CMS_PREFIX}.${APP_URL}/v1`;

  let test;
  if (!TESTVAL) {
    test = 'all';
  }
  else {
    test = TESTVAL
  }

  studentTest(cmsUrl, data, test);
}