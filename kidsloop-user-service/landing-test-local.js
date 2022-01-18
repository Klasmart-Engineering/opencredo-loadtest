import { landingTest } from './functions.js';
import * as env from '../utils/env.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<2000'] // 95% of the iteration duration below 2s
  }
}

export default function main(data) {

  let test;
  if (!env.TESTVAL) {
    test = 'all';
  }
  else {
    test = env.TESTVAL
  }

  landingTest(env.APP_URL, env.ACCESS_COOKIE, test);
}