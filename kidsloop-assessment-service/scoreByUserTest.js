import * as env         from '../utils/env.js';
import {
  APIHeaders,
  defaultRateOptions,
  initCookieJar,
  isRequestSuccessful
} from '../utils/common.js';
import {
  assessmentEndpoint,
  query
} from './common.js';
import { http }       from 'k6/http';
import { loginSetup } from '../utils/setup.js';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof assessment-service
 * @alias scoreByUserTestOptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the score by user test
 *
 * @returns {Function} returns the default setup function
 * @memberof assessment-service
 * @alias scoreByUserTestSetup
 */
export function setup() {
  return loginSetup();
}

/**
 * function for k6 to run the score by user test
 *
 * @param {object} data -result of setup function above
 * @returns {void} Nothing
 * @memberof assessment-service
 * @alias scoreByUserTestMain
 */
export default function main(data) {

  initCookieJar(assessmentEndpoint, data.accessCookie);

  scoreByUser();
}

/**
 * function to run the score by user test
 *
 * @returns {void} Nothing
 * @memberof assessment-service
 */
export function scoreByUser() {

  const graphqlEndpoint = `${assessmentEndpoint}graphql`;

  const response = http.post(graphqlEndpoint, JSON.stringify({
    query: query,
    variables: {
      id: env.ROOM_ID
    }
  }), {
    headers: APIHeaders
  });

  isRequestSuccessful(response);
}