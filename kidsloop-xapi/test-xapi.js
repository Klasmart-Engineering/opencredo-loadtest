import { loginSetup } from '../utils/setup.js'
import { xapiTest } from './functions.js'

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
const USERNAME = __ENV.USERNAME
const AMSENV = __ENV.AMSENV

export function setup() {

  console.log(APP_URL);
  let amsEnv = AMSENV
  if (!amsEnv) {
    amsEnv = 'dev'
  }

  return {
    accessCookie: loginSetup(APP_URL, USERNAME, amsEnv)
  }
}

export default function main(data) {
  xapiTest(`https://api.${APP_URL}/xapi/graphql`, data.accessCookie);
}