import { loginTest } from './functions.js';
import * as env from '../utils/env.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<4000'] // 95% of the iteration duration below 4s
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

export default function main(data) {
  loginTest(env.APP_URL, env.TENANT_ID, env.HUB_CLIENT_ID, env.AUTH_CLIENT_ID, env.POLICY_NAME, env.USERNAME, env.PASSWORD);
}