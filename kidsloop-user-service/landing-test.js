import { loginSetup } from '../utils/setup.js';
import { landingTest } from './functions.js';
import * as env from '../utils/env.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<8000'] // 95% of the iteration duration below 2s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        mumbaiDistribution: {
          loadZone: 'amazon:gb:london',
          percent: 50
        },
        portlandDistribution: {
          loadZone: 'amazon:ie:dublin',
          percent: 50
        },
      }
    }
  },
}

export function setup() {
  return loginSetup();
}

export default function main(data) {

  const userUrl = `https://api.${env.APP_URL}/user/`;

  let test;
  if (!env.TESTVAL) {
    test = 'all';
  }
  else {
    test = env.TESTVAL
  }

  landingTest(userUrl, data, test);
}