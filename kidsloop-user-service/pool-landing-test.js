import {
  options as defaultOptions,
  landingTest
} from './landing-test.js';
import {
  getCurrentUserFromPool as getCurrentUser,
  getUserPool
} from '../utils/common.js';
import { initUserCookieJar } from './common.js';
import { scenario }          from 'k6/execution';

/**
 * options for k6, expanding the default options with an increased setup timeout
 *
 * @constant
 * @type {object}
 * @memberof user-service
 * @alias poolLandingTestOptions
 */
export const options = Object.assign({}, defaultOptions, {
  setupTimeout: '30m'
});

/**
 * function for k6 to setup the user pool variant of the user service landing test
 *
 * @returns {Function} User pool function
 * @memberof user-service
 * @alias poolLandingTestSetup
 */
export function setup() {
  return getUserPool();
}


/**
 * function for k6 to run the user pool variant of the user service landing test
 *
 * @param {object} data - user pool access cookies
 * @returns {void} Nothing
 * @memberof user-service
 * @alias poolLandingTestMain
 */
export default function main(data) {

  const id = getCurrentUser(scenario.iterationInTest);

  const accessCookie = data[id];

  initUserCookieJar(accessCookie);

  landingTest();
}