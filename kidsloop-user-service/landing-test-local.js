import { initUserCookieJar } from './common.js';
import { landingTest } from './landing-test.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<2000'] // 95% of the iteration duration below 2s
  }
}

//This should be a JWT string
const ACCESS_COOKIE = __ENV.ACCESS_COOKIE


export default function main(data) {

  initUserCookieJar(ACCESS_COOKIE)

  landingTest();
}