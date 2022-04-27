import * as env     from '../utils/env.js';
import * as queries from './queries.js';
import {
  APIHeaders,
  defaultRateOptions,
  getCurrentUserFromPool,
  getUserPool,
  initCookieJar,
  isRequestSuccessful,
  sizeOfHeaders
} from '../utils/common.js';
import {
  Counter,
  Trend
} from 'k6/metrics';
import { check }    from 'k6';
import http         from 'k6/http';
import { scenario } from 'k6/execution';
import uuid         from '../utils/uuid.js';

/**
 * Construct an XAPI specific endpoint, allows authenticating against a seperate system to test by setting `APP_URL_TEST`
 *
 * @constant
 * @memberof xapi-server
 */
const xapiEndpoint = env.APP_URL_TEST ? `https://api.${env.APP_URL_TEST}/xapi/graphql` : `https://api.${env.APP_URL}/xapi/graphql`;

/**
 * options for k6, expanding the default options with an increased setup timeout
 *
 * @constant
 * @type {object}
 * @memberof xapi-server
 * @alias xapiTestOptions
 */
export const options = Object.assign({}, defaultRateOptions, {
  setupTimeout: '30m',
  thresholds: {
    xapi_http_duration: ['p(99)<1000']
  }
});

const xapiHTTPDuration = new Trend('xapi_http_duration', true);
const xapiHTTPCount = new Counter('xapi_http_reqs');
const xapiDataReceived = new Counter('xapi_data_received');
const xapiDataSent = new Counter('xapi_data_sent');

/**
 * function for k6 to setup the xapi test
 *
 * @returns {Function} User pool function
 * @memberof xapi-server
 * @alias xapiTestSetup
 */
export function setup() {
  const returnUserIDs = false;
  const userPool = getUserPool(returnUserIDs);

  console.log(xapiEndpoint);

  return userPool;
}

/**
 * function for k6 to run the xapi test
 *
 * @param {object} data - user pool access cookies
 * @returns {void} Nothing
 * @memberof xapi-server
 * @alias xapiTestSetup
 */
export default function main(data) {
  const user = getCurrentUserFromPool(scenario.iterationInTest);
  initCookieJar(xapiEndpoint, data[user]);

  const response = xapiTest(xapiEndpoint);
  checkRequest(response);
  return response;
}

/**
 * function to handle an xapi test
 *
 * @returns {Function} a k6 http post request
 * @memberof xapi-server
 */
function xapiTest() {
  const xapiEvent = `{"xapi":{"type":"xAPI","data":{"statement":{"actor":{"account":{"name":"${uuid.v4()}"},"objectType":"Agent"},"verb":{"id":"http://adlnet.gov/expapi/verbs/attempted","display":{"en-US":"attempted"}},"object":{"objectType":"Activity","definition":{"extensions":{"http://h5p.org/x-api/h5p-local-content-id":"611db969c426830013108c40"},"name":{"en-US":"Celebration Memory Game 2"}}},"context":{"contextActivities":{"category":[{"id":"http://h5p.org/libraries/H5P.MemoryGame-1.3","objectType":"Activity"}]}}}},"clientTimestamp":${Date.now()}},"userId":"${uuid.v4()}","ipHash":"152592a2f2db5a645d9e1bd6468368be0d15cfb7c96ac1099313d85e810adb52","geo":{"range":[1531035136,1531035647],"country":"DE","region":"BE","eu":"1","timezone":"Europe/Berlin","city":"Berlin","ll":[52.4669,13.4298],"metro":0,"area":5},"serverTimestamp":${Date.now()}}`;
  return http.post(xapiEndpoint, JSON.stringify({
    query: queries.SEND_EVENT,
    operationName: 'xapi',
    variables: {
      xapiEvents: [
        xapiEvent
      ]
    }
  }), {
    headers: APIHeaders
  });
}

/**
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof xapi-service
 */
function checkRequest(response) {

  xapiHTTPCount.add(1);
  trackDataMetricsPerURL(response);
  xapiHTTPDuration.add(response.timings.duration);
  check(response, { 'XAPI status is 200': (r) => r.status = 200 });

  isRequestSuccessful(response);
}

/**
 *
 * @param {*} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof xapi-service
 */
function trackDataMetricsPerURL(response) {

  xapiDataSent.add(sizeOfHeaders(response.request.headers) + response.request.body.length);
  xapiDataReceived.add(sizeOfHeaders(response.headers) + response.body.length);
}