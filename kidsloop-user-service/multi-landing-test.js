import { defaultRateOptions }                 from '../utils/common.js';
import { getUserIDForMultiUser as getUserID } from '../utils/common.js';
import { initUserCookieJar }                  from './common.js';
import { landingTest }                        from './landing-test.js';
import { loginSetupB2C }                      from '../utils/setup.js';
import { scenario }                           from 'k6/execution';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof user-service
 * @alias multiLandingTestOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the multi user variant of the user service landing test
 *
 * @returns {void} Nothing
 * @memberof user-service
 * @alias multiLandingTestSetup
 */
export function setup() {}

/**
 * function for k6 to run the multi user variant of the user service landing test
 *
 * @returns {void} Nothing
 * @memberof user-service
 * @alias multiLandingTestMain
 */
export default function main() {

  const userID = getUserID(scenario.iterationInTest);

  const accessCookie = loginSetupB2C(userID);

  initUserCookieJar(accessCookie);

  landingTest();
}