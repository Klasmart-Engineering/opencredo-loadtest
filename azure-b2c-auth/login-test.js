import {
  defaultRateOptions,
  getCurrentUserFromPool,
  getUserIDForMultiUser
} from '../utils/common.js';
import { loginToB2C } from './functions.js';
import { scenario }   from 'k6/execution';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof azure-b2c
 * @alias loginTestOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to run the b2c login test
 *
 * @memberof azure-b2c
 * @alias loginTestMain
 */
export default function main() {

  const userVal = getCurrentUserFromPool(scenario.iterationInTest);

  const userID = getUserIDForMultiUser(userVal);

  loginToB2C(userID);
}