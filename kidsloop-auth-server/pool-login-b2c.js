import {
  defaultRateOptions,
  getB2CTokenPool,
  getCurrentUserFromPool,
} from '../utils/common.js';
import { authLoginB2C } from './login-b2c.js';
import { scenario }     from 'k6/execution';

/**
 * options for k6, set to default rate options with an adjusted setup timeout
 *
 * @constant
 * @type {object}
 * @memberof auth-server
 * @alias poolLoginB2COptions
 */
export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m',
  thresholds: {
    auth_http_duration: ['p(99)<1000']
  }
});

/**
 * function for k6 to setup the pool login auth test
 *
 * @returns {object} object containing the 3 tokens returned from B2C and the user ID
 * @memberof auth-server
 * @alias poolLoginB2CSetup
 */
export function setup() {

  return getB2CTokenPool();
}

/**
 * function for k6 to run the pool login auth test
 *
 * @param {object} data -result of setup function above
 * @memberof auth-server
 * @alias poolLoginB2CMain
 */
export default function main(data) {

  const id = getCurrentUserFromPool(scenario.iterationInTest);

  const userData = data[id];

  authLoginB2C(userData.access_token, userData.user_id);
}