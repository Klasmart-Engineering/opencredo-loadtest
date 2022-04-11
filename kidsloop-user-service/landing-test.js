import http from 'k6/http';
import { check, group } from 'k6';
import {
  APIHeaders,
  defaultSetup,
  initUserCookieJar,
  requestOverThreshold,
  threshold,
  userEndpoint
} from './common.js';
import * as queries from './queries/landing.js'
import * as env from '../utils/env.js';
import { defaultRateOptions, isRequestSuccessful } from '../utils/common.js';
import { Counter, Trend } from 'k6/metrics';

export const options = Object.assign(defaultRateOptions, {

  thresholds: {
    landing_http_duration: ['p(99)<1000']
  }
});

const landingHTTPDuration = new Trend('landing_http_duration', true);
const landingHTTPCount = new Counter('landing_http_reqs');
const landingDataSent = new Counter('landing_data_sent');
const landingDataReceived = new Counter('landing_data_received');

export function setup() {
  return defaultSetup();
}

export default function main(data) {

  initUserCookieJar(data.accessCookie);
  
  landingTest();
};

function sizeOfHeaders(hdrs) {

  return Object.keys(hdrs).reduce((sum, key) => sum + key.length + hdrs[key].length, 0);
}

function trackDataMetricsPerURL(res) {

  landingDataSent.add(sizeOfHeaders(res.request.headers) + res.request.body.length);

  landingDataReceived.add(sizeOfHeaders(res.headers) + res.body.length);
};

function checkRequest(response) {

  landingHTTPCount.add(1);

  trackDataMetricsPerURL(response);

  check(response, { 'user status is 200': (r) => r.status === 200 });

  landingHTTPDuration.add(response.timings.duration);
  
  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
  
  isRequestSuccessful(response);
};

export function landingTest() {

  let testValue = env.TESTVAL;

  if (!testValue) {

    testValue = 'all';
  };

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
  
      ORGID = response.json('data.me.memberships.0.organization_id')
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
  
    let ID = ''
  
    if (response.body) {
      ID = response.json('data.my_users.0.user_id')
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
  })
}