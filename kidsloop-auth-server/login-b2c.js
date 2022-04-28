import {
  APIHeaders,
  AuthEndpoint
} from './common.js';
import {
  Counter,
  Trend
} from 'k6/metrics';
import {
  defaultRateOptions,
  isRequestSuccessful,
  sizeOfHeaders
} from '../utils/common.js';
import { check }        from 'k6';
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
 * custom trend metric for auth server http durations
 *
 * @constant
 * @memberof auth-server
 */
const authHTTPDuration = new Trend('auth_http_duration', true);

/**
 * custom counter metric for auth server http request counting
 *
 * @constant
 * @memberof auth-server
 */
const authHTTPCount = new Counter('auth_http_reqs');

/**
 * custom counter metric for tracking auth server data transfer - received
 *
 * @constant
 * @memberof auth-server
 */
const authDataReceived = new Counter('auth_data_received');

/**
 * custom counter metric for tracking auth server data transfer - sent
 *
 * @constant
 * @memberof auth-server
 */
const authDataSent = new Counter('auth_data_sent');

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

  //initialise the cookies for this VU
  http.cookieJar();

  authLoginB2C(data.access_token, data.user_id);
}

/**
 * function to run the auth login test in a B2C environment
 *
 * @param {string} accessToken - the bearer token to perform the login
 * @param {string} userID - the ID of the user to switch to
 * @returns {void} Nothing
 * @memberof auth-server
 */
export function authLoginB2C(accessToken, userID) {

  let response;

  const authHeader = {
    Authorization: `Bearer ${accessToken}`
  };

  response = http.post(`${AuthEndpoint}/transfer`, '', {
    headers: Object.assign(APIHeaders, authHeader),
  });
  checkRequest(response);

  const switchPayload = JSON.stringify({
    user_id: userID
  });

  response = http.post(`${AuthEndpoint}/switch`, switchPayload, {
    headers: APIHeaders
  });
  checkRequest(response);

  response = http.get(`${AuthEndpoint}/refresh`, {
    headers: APIHeaders,
  });
  checkRequest(response);

}

/**
 * function that will take a k6/http response and run it through metric validation
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof auth-server
 * @alias authCheckRequest
 */
function checkRequest(response) {

  authHTTPCount.add(1);
  trackDataMetricsPerURL(response);
  authHTTPDuration.add(response.timings.duration);
  check(response, { 'Auth status is 200': (r) => r.status = 200 });

  isRequestSuccessful(response);
}

/**
 * function that will sum the length of the body and headers and add them to the landing tracking metrics
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof auth-server
 */
function trackDataMetricsPerURL(response) {

  authDataSent.add(sizeOfHeaders(response.request.headers) + response.request.body.length);
  authDataReceived.add(sizeOfHeaders(response.headers) + response.body.length);
}