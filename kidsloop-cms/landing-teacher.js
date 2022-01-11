import { loginSetup } from '../utils/setup.js'
import { ecsOrgID, k8sOrgID, teacherTest } from './functions.js';

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

const APP_URL = __ENV.APP_URL
const USERNAME = __ENV.USERNAME

const TESTVAL = __ENV.test

export function setup() {
  return loginSetup(APP_URL, USERNAME, 'dev');
}

export default function main(data) {

  const cmsUrl = `https://cms.${APP_URL}/v1`;

  let orgID;
  if (APP_URL.includes('k8s')) {
    orgID = k8sOrgID
  }
  else {
    orgID = ecsOrgID
  }

  teacherTest(cmsUrl, data, orgID);
}