// import k6 specific packages
import http from 'k6/http';

import { loginSetup } from '../utils/setup.js'
import { studentTest, APIHeaders } from './functions.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 2s
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
const CMS_PREFIX = __ENV.CMS_PREFIX
const USERNAME = __ENV.USERNAME
const AMSENV = __ENV.AMSENV

export function setup() {

  console.log(APP_URL);
  let amsEnv = AMSENV
  if (!amsEnv) {
    amsEnv = 'dev'
  }

  const accessCookie = loginSetup(APP_URL, USERNAME, amsEnv);

  const orgResp = http.post(`https://api.${APP_URL}/user/`, JSON.stringify({
    query: '{\n  my_users {\n    memberships {\n      organization_id\n      status\n    }\n  }\n}',
    variables: {},
  }), {
    headers: APIHeaders,
    cookies: {
      access: accessCookie,
    }
  })

  return {
    accessCookie: accessCookie,
    orgID: orgResp.json('data.my_users.0.memberships.0.organization_id')
  }
}

export default function main(data) {
  studentTest(`https://${CMS_PREFIX}.${APP_URL}/v1`, data.accessCookie, data.orgID);
}