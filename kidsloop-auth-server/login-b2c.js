import {
  APIHeaders,
  AuthEndpoint
} from './common.js';
import {
  defaultRateOptions,
  isRequestSuccessful
} from '../utils/common.js';
import { getUserIDB2C } from '../utils/setup.js';
import http             from 'k6/http';
import { loginToB2C }   from '../azure-b2c-auth/functions.js';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof auth-server
 * @alias loginB2COptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the login auth test
 *
 * @returns {object} object containing the 3 tokens returned from B2C and the user ID
 * @memberof auth-server
 * @alias loginB2CSetup
 */
export function setup() {

  // eslint-disable-next-line no-undef
  const loginResp = loginToB2C(__ENV.USERNAME);

  const userID = getUserIDB2C(loginResp.json('access_token'));

  return {
    access_token: loginResp.json('access_token'),
    id_token: loginResp.json('id_token'),
    refresh_token: loginResp.json('refresh_token'),
    user_id: userID
  };
}

/**
 * function for k6 to run the login auth test
 *
 * @param {object} data -result of setup function above
 * @memberof auth-server
 * @alias loginB2CMain
 */
export default function main(data) {

  let response;

  //initialise the cookies for this VU
  http.cookieJar();

  const authHeader = {
    Authorization: `Bearer ${data.access_token}`
  };

  response = http.post(`${AuthEndpoint}/transfer`, '', {
    headers: Object.assign(APIHeaders, authHeader),
  });
  isRequestSuccessful(response);

  const switchPayload = JSON.stringify({
    user_id: data.user_id
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