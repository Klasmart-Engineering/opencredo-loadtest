/**
 * @namespace common
 */
import * as env   from './env.js';
import {
  getUserIDB2C,
  loginSetupB2C
} from './setup.js';
import { Counter }    from 'k6/metrics';
import http           from 'k6/http';
import { loginToB2C } from '../azure-b2c-auth/functions.js';

/** Requests to kidsloop APIs almost always need the same headers set. This allows us to export this once here rather than repeating in each test. */

/**
 * user agent to pass to the services
 *
 * @constant
 * @type {string}
 * @memberof common
 */
const userAgent = 'k6 - open credo loadtest';

/**
 * default headers with user agent and pragma
 *
 * @constant
 * @type {object}
 * @memberof common
 */
export const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};

/**
 * standard API Headers
 *
 * @constant
 * @type {object}
 * @memberof common
 */
export const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders);

/**
 * initalises a k6 counter that will be used to count http requests over a certain threshold, set with the THRESHOLD environment variable
 *
 * @constant
 * @memberof common
 */
const requestOverThreshold = new Counter('requests over specified threshold', false);

/**
 * function to log errors and increase threshold counter
 *
 * @param {object} response - a k6/http response type
 * @param {number} [expectedStatus=200] - in case the expected status is not 200 it can be passed here
 * @returns {void} Nothing
 * @memberof common
 */
export function isRequestSuccessful(response, expectedStatus = 200) {

  if (response.timings.duration >= env.THRESHOLD ) {
    requestOverThreshold.add(1);
  }

  if (response.status !== expectedStatus) {
    console.error(response.status);
    console.error(JSON.stringify(response));
  }
}

/**
 * function to initalise standard cookies in a [k6 cookie jar]{@link https://k6.io/docs/using-k6/cookies} that are consumed across the application. Allows setting once per VU
 *
 * @param {string} endpoint - the specific endpoint to use for the cookie jar
 * @param {string} accessCookieData - an access cookie JWT
 * @returns {void} Nothing
 * @memberof common
 */
export function initCookieJar(endpoint, accessCookieData) {
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(endpoint, 'access', accessCookieData);
  cookieJar.set(endpoint, 'locale', 'en');
  cookieJar.set(endpoint, 'privacy', 'true');
}

/**
 * Sets a max VU cap to 10k to avoid over-consumption of compute
 * in case we are using far less VUs as a target in order to reduce setup times we set it to 10x the VU count
 *
 * @constant
 * @type {number}
 * @memberof common
 */
const maxVUs = (env.vus * 10) > 10000 ? 10000 : env.vus * 10;

/**
 * k6 options object that will configure k6 to run a scenario where it targets a constant arrival rate
 * This should be the default options used as we are primarily interested in the possible throughput of a service/endpoint
 * To overwrite the thresholds specified see example below:
 *
 * @example export const options = Object.Assign({}, defaultRateOptions, { thresholds: { <new thresholds> } })
 * @constant
 * @type {object}
 * @memberof common
 */
export const defaultRateOptions = {

  scenarios: {
    main: {
      executor: 'constant-arrival-rate',
      rate: env.rate,
      duration: env.duration,
      preAllocatedVUs: env.vus,
      maxVUs: maxVUs,
    }
  },

  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(99)'],

  thresholds: {
    http_req_duration: ['p(99)<1000'],
    http_req_failed: ['rate<0.01']
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        londonDistribution: {
          loadZone: 'amazon:gb:london',
          percent: 50
        },
        dublinDistribution: {
          loadZone: 'amazon:ie:dublin',
          percent: 50
        },
      }
    }
  },
};

/**
 * Below are functions related to using a pool of unique users in a test.
 * In order to make use of these the environment must have the users loaded in to the kidsloop application and the Azure B2C tenant
 */

/**
 * function takes a number and returns a user email address
 *
 * @param {number} iterationValue - usually the iteration value from a test but can be arbritary
 * @returns {string} User ID from user pool
 * @memberof common
 */
export function getUserIDForMultiUser(iterationValue) {

  const baseNumber = 100000;

  let it = iterationValue - 1;

  if (it > 99999) {
    it = it - 99999;
  }

  const userID = baseNumber + (it);

  return `loadtestuser${userID}@testdomain.com`;
}

/**
 * function to login a pool of users that can be iterated over in a test
 *
 * @param {boolean} [returnIDs=false] - if set to true function returns an object with the access cookie string and user ID
 * @returns {object} Contains access cookies or an object with an access cookie and matching user ID
 * @memberof common
 */
export function getUserPool(returnIDs = false) {

  let returnVal = {};
  let vus;

  // If the number of vus we are using is higher than the cap we set on our user pool then we only login up to the pool cap.
  // This is to prevent extremely long setup times with large numbers of VUs
  if (env.vus >= env.poolCap) {
    vus = env.poolCap;
  }
  else {
    vus = env.vus;
  }

  for (let index = 0; index < vus; index++) {
    if (returnIDs) {
      returnVal[index] = loginSetupB2C(getUserIDForMultiUser(index + 1), true);
    }
    else {
      returnVal[index] = loginSetupB2C(getUserIDForMultiUser(index + 1));
    }
  }

  return returnVal;
}

/**
 * function to fetch the index of the user pool to use based on passed in value
 *
 * @param {number} num - usually the iteration value from a test but can be arbritary
 * @returns {number} index of the user pool to use
 * @memberof common
 */
export function getCurrentUserFromPool(num) {

  // ensure we're returning up to our total pool number
  const userPoolCount = env.vus < env.poolCap ? env.vus : env.poolCap;

  const value = num % userPoolCount;

  if ((value - 1) < 0 ) {
    return userPoolCount - 1;
  }

  return value - 1;
}

/**
 * function to log into B2C without logging in to the kidsloop domain - useful for including auth as part of the main test
 *
 * @returns {object} a series of nested objects containing the tokens and matching user ID
 * @memberof common
 */
export function getB2CTokenPool() {

  let returnVal = {};
  let vus;

  if (env.vus >= env.poolCap) {
    vus = env.poolCap;
  }
  else {
    vus = env.vus;
  }

  for (let index = 0; index < vus; index++) {

    let loginResp = loginToB2C(getUserIDForMultiUser(index + 1));

    let userID = getUserIDB2C(loginResp.json('access_token'));

    returnVal[index] = {
      access_token: loginResp.json('access_token'),
      id_token: loginResp.json('id_token'),
      refresh_token: loginResp.json('refresh_token'),
      user_id: userID
    };
  }

  return returnVal;
}

/**
 * function takes a k6 header object and returns a sum of the length of the key and value
 *
 * @param {object} headers - The headers from either a request or response
 * @returns {number} summed length of headers
 * @memberof common
 */
export function sizeOfHeaders(headers) {

  return Object.keys(headers).reduce((sum, key) => sum + key.length + headers[key].length, 0);
}