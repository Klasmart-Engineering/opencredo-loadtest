import http             from 'k6/http';
import { check, group } from 'k6';
import {
  APIHeaders,
  defaultSetup,
  initUserCookieJar,
  userEndpoint
} from './common.js';
import * as queries                                from './queries/landing.js';
import * as env                                    from '../utils/env.js';
import { defaultRateOptions, isRequestSuccessful } from '../utils/common.js';
import { Counter, Trend }                          from 'k6/metrics';

/**
 * options for k6 that include a custom threshold that will fail the test based on only results from the landing test function
 *
 * @constant
 * @type {object}
 * @memberof user-service
 * @alias landingTestOptions
 */
export const options = Object.assign(defaultRateOptions, {

  thresholds: {
    landing_http_duration: ['p(99)<1000']
  }
});

/**
 * initalise a Trend k6 metric to track the http duration of calls made in this test
 * this can then be used to gather specific metrics
 *
 * @constant
 * @memberof user-service
 */
const landingHTTPDuration = new Trend('landing_http_duration', true);

/**
 * initalise a Counter k6 metric to track the total number of requests made in this test
 *
 * @constant
 * @memberof user-service
 */
const landingHTTPCount = new Counter('landing_http_reqs');

/**
 * initalise a Counter k6 metric to track the total data sent in this test
 *
 * @constant
 * @memberof user-service
 */
const landingDataSent = new Counter('landing_data_sent');

/**
 * initalise a Counter k6 metric to track the total data received in this test
 *
 * @constant
 * @memberof user-service
 */
const landingDataReceived = new Counter('landing_data_received');

/**
 * function for k6 to setup the user service landing test
 *
 * @returns {Function} returns the default setup function
 * @memberof user-service
 * @alias landingTestSetup
 */
export function setup() {
  return defaultSetup();
}

/**
 * function for k6 to run the user service landing test
 *
 * @param {object} data -result of setup function above
 * @memberof user-service
 * @alias landingTestMain
 */
export default function main(data) {

  initUserCookieJar(data.accessCookie);

  landingTest();
}

/**
 * function takes a k6 header object and returns a sum of the length of the key and value
 *
 * @param {object} headers - The headers from either a request or response
 * @returns {number} summed length of headers
 * @memberof user-service
 */
function sizeOfHeaders(headers) {

  return Object.keys(headers).reduce((sum, key) => sum + key.length + headers[key].length, 0);
}

/**
 * function that will sum the length of the body and headers and add them to the landing tracking metrics
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof user-service
 */
function trackDataMetricsPerURL(response) {

  landingDataSent.add(sizeOfHeaders(response.request.headers) + response.request.body.length);

  landingDataReceived.add(sizeOfHeaders(response.headers) + response.body.length);
}

/**
 * function that will take a k6/http response and run it through metric validation
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof user-service
 */
function checkRequest(response) {

  landingHTTPCount.add(1);

  trackDataMetricsPerURL(response);

  check(response, { 'user status is 200': (r) => r.status === 200 });

  landingHTTPDuration.add(response.timings.duration);

  isRequestSuccessful(response);
}

/**
 * function called by k6 main that runs through the landing requests
 *
 * @returns {void} Nothing
 * @memberof user-service
 */
export function landingTest() {

  let testValue = env.TESTVAL;

  if (!testValue) {

    testValue = 'all';
  }

  let response;

  group('landing', () => {

    if (testValue == 1 || testValue == 'all' ) {

      response = http.post(userEndpoint, JSON.stringify({
        query: queries.ME,
        operationName: 'me',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    if (testValue == 2 || testValue == 'all') {

      response = http.post(userEndpoint, JSON.stringify({
        query: queries.MY_USER,
        operationName: 'myUser',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    if (testValue == 3 || testValue == 'all') {

      response = http.post(userEndpoint, JSON.stringify({
        query: queries.MEMBERSHIPS,
        operationName: 'memberships',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    if (testValue == 4 || testValue == 6 || testValue == 'all') {

      response = http.post(userEndpoint, JSON.stringify({
        query: queries.ORG_MEMBERSHIPS,
        operationName: 'orgMemberships',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    let ORGID = '';

    if (response.body) {

      ORGID = response.json('data.me.memberships.0.organization_id');
    }

    if (testValue == 5 || testValue == 6 || testValue == 'all' ) {

      response = http.post(userEndpoint, JSON.stringify({
        query: queries.MY_USERS,
        operationName: 'myUsers',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    let ID = '';

    if (response.body) {
      ID = response.json('data.my_users.0.user_id');
    }

    if ((testValue == 6 || testValue == 'all') && (ID && ORGID)) {

      response = http.post(userEndpoint, JSON.stringify({
        query: queries.GET_USER_NODE,
        operationName: 'userNode',
        variables: {
          id: ID,
          organizationId: ORGID
        }
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    if (testValue == 7 || testValue == 'all') {
      response = http.post(userEndpoint, JSON.stringify({
        query: queries.GET_MY_CLASSES,
        operationName: 'myClasses',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }

    if (testValue == 8 || testValue == 'all') {
      response = http.post(userEndpoint, JSON.stringify({
        query: queries.GET_PERMS,
        operationName: 'permissions',
      }), {
        headers: APIHeaders
      });

      checkRequest(response);
    }
  });
}