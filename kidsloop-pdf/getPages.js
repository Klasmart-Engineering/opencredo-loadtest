import { loginSetup } from '../utils/setup.js'
import { initCookieJar } from '../utils/common.js'
import { prerender } from './common.js'
import { getPagesTest } from './functions.js'

const APP_URL = __ENV.APP_URL
const USERNAME = __ENV.USERNAME
const AMSENV = __ENV.AMSENV
const RATE = __ENV.RATE || 1

const pdfEndpoint = `https://api.${APP_URL}/pdf`;
const pdfFileName = '61f7ce22ee9e045916473c5c.pdf';

// Configure options
export const options = {
  ext: {
    loadimpact: {
      projectID: 3560234,
    }
  },
  scenarios: {
    pages: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      duration: '30s',
      preAllocatedVUs: 100,
      maxVUs: 10000,
    }
  }
};

export function setup() {
  let amsEnv = AMSENV
  if (!amsEnv) {
    amsEnv = 'dev'
  }

  const accessCookie = loginSetup(APP_URL, USERNAME, amsEnv);
  prerender(accessCookie, pdfEndpoint, pdfFileName);

  return {
    accessCookie: accessCookie
  }
}

export default function main(data) {
  initCookieJar(data.accessCookie);
  getPagesTest(pdfEndpoint, pdfFileName);
}
