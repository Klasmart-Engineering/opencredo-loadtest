import {
  defaultRateOptions,
  getCurrentUserFromPool,
  getUserPool,
  initCookieJar,
} from '../utils/common.js';
import { assessmentEndpoint } from './common.js';
import { scenario }           from 'k6/execution';
import { scoreByUser }        from './scoreByUserTest';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof assessment-service
 * @alias mutliScoreByUserTestOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the multi score by user test
 *
 * @returns {Function} returns the user pool function
 * @memberof assessment-service
 * @alias multiScoreByUserTestSetup
 */
export function setup() {
  return getUserPool();
}

/**
 * function for k6 to run the multi score by user test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof assessment-service
 * @alias multiScoreByUserTestMain
 */
export default function main(data) {
  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(assessmentEndpoint, data[user]);
  scoreByUser();
}