import {
  APIHeaders,
  AuthEndpoint,
} from './common.js';
import {
  defaultRateOptions,
  getB2CTokenPool,
  getCurrentUserFromPool,
  isRequestSuccessful
} from '../utils/common.js';
import http         from 'k6/http';
import { scenario } from 'k6/execution';

/**
 * options for k6, set to default rate options with an adjusted setup timeout
 *
 * @constant
 * @type {object}
 * @memberof auth-server
 * @alias poolLoginB2COptions
 */
export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '15m'
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

  let response;

  //initialise the cookies for this VU
  http.cookieJar();

  const authHeader = {
    Authorization: `Bearer ${userData.access_token}`
  };

  response = http.post(`${AuthEndpoint}/transfer`, '', {
    headers: Object.assign(APIHeaders, authHeader),
  });
  isRequestSuccessful(response);

  const switchPayload = JSON.stringify({
    user_id: userData.user_id
  });

  response = http.post(`${AuthEndpoint}/switch`, switchPayload, {
    headers: APIHeaders
  });
  isRequestSuccessful(response);

  response = http.get(`${AuthEndpoint}/refresh`, {
    headers: APIHeaders,
  });
  isRequestSuccessful(response);
}