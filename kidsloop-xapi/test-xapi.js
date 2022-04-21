import * as env         from '../utils/env.js';
import * as queries     from './queries.js';
import {
  APIHeaders,
  defaultRateOptions,
  getCurrentUserFromPool,
  getUserPool,
  initCookieJar,
  isRequestSuccessful
} from '../utils/common.js';
import { http }     from 'k6/http';
import { scenario } from 'k6/execution';
import { uuid }     from '../utils/uuid.js';

const xapiEndpoint = env.APP_URL_TEST ? `https://api.${env.APP_URL_TEST}/xapi/graphql` : `https://api.${env.APP_URL}/xapi/graphql`;

export const options = defaultRateOptions;
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
  isRequestSuccessful(response);
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