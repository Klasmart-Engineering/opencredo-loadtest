import { initUserCookieJar } from './common.js';
import { landingTest }       from './landing-test.js';

/**
 * options for k6
 *
 * @constant
 * @type {object}
 * @memberof user-service
 * @alias landingTestLocalOptions
 */
export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<2000'] // 95% of the iteration duration below 2s
  }
};

/**
 * a valid JWT string for local access
 *
 * @constant
 * @type {string}
 * @memberof user-service
 */
// eslint-disable-next-line no-undef
const ACCESS_COOKIE = __ENV.ACCESS_COOKIE;

/**
 * function for k6 to run the local landing test
 *
 * @returns {void} Nothing
 * @memberof user-service
 * @alias landingTestLocalMain
 */
export default function main() {

  initUserCookieJar(ACCESS_COOKIE);

  landingTest();
}