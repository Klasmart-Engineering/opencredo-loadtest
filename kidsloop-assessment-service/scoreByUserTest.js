import * as env   from '../utils/env.js';
import {
  APIHeaders,
  defaultRateOptions,
  initCookieJar,
  isRequestSuccessful,
  sizeOfHeaders
} from '../utils/common.js';
import {
  assessmentEndpoint,
  query
} from './common.js';
import {
  Counter,
  Trend
} from 'k6/metrics';
import { check }      from 'k6';
import http           from 'k6/http';
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
 * custom trend metric for assessment http durations
 *
 * @constant
 * @memberof assessment-service
 */
const assessmentHTTPDuration = new Trend('assessment_http_duration', true);

/**
 * custom counter metric for assessment http request counting
 *
 * @constant
 * @memberof assessment-service
 */
const assessmentHTTPCount = new Counter('assessment_http_reqs');

/**
 * custom counter metric for tracking assessment data transfer - received
 *
 * @constant
 * @memberof assessment-service
 */
const assessmentDataReceived = new Counter('assessment_data_received');

/**
 * custom counter metric for tracking assessment data transfer - sent
 *
 * @constant
 * @memberof assessment-service
 */
const assessmentDataSent = new Counter('assessment_data_sent');

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

  checkRequest(response);
}

/**
 * function that will take a k6/http response and run it through metric validation
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof assessment-service
 */
function checkRequest(response) {

  assessmentHTTPCount.add(1);
  trackDataMetricsPerURL(response);
  assessmentHTTPDuration.add(response.timings.duration);
  check(response, { 'Assessment status is 200': (r) => r.status = 200 });

  isRequestSuccessful(response);
}

/**
 * function that will sum the length of the body and headers and add them to the landing tracking metrics
 *
 * @param {*} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof assessment-service
 */
function trackDataMetricsPerURL(response) {

  assessmentDataSent.add(sizeOfHeaders(response.request.headers) + response.request.body.length);
  assessmentDataReceived.add(sizeOfHeaders(response.headers) + response.body.length);
}