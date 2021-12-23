import { loginSetup } from '../utils/setup.js'
import { landingTest } from './functions.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<2000'] // 95% of the iteration duration below 2s
  }
}

const APP_URL = 'http://localhost:8080/user/'

const TESTVAL = __ENV.test

//This should be a JWT string
const ACCESS_COOKIE = __ENV.ACCESS_COOKIE


export default function main(data) {

  let test;
  if (!TESTVAL) {
    test = 'all';
  }
  else {
    test = TESTVAL
  }

  landingTest(APP_URL, ACCESS_COOKIE, test);
}