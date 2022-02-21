import {
  initCookieJar
} from "./common.js";
import { scenario } from 'k6/execution';
import { landingTest } from "./landing-test.js";
import { loginSetupB2C } from "../utils/setup.js";

const vus = __ENV.vus ? __ENV.vus : 1;
const duration = __ENV.duration ? __ENV.duration : '1m';

export const options = {
  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 2s
  },

  scenarios: {
    main: {
      executor: 'constant-vus',
      vus: vus,
      duration: duration
    }
  }
}

export function setup() {};

const getUserID = (iterationValue) => {

  const baseNumber = 100000;

  let it = iterationValue - 1;

  if (it > 99999) {
    it = it - 99999
  }

  const userID = baseNumber + (it);

  return `loadtestuser${userID}@testdomain.com`
}

export default function main() {

  const userID = getUserID(scenario.iterationInTest);

  const accessCookie = loginSetupB2C(userID);

  initCookieJar(accessCookie);

  landingTest();
}