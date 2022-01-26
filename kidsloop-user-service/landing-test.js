import http from 'k6/http';
import {
  APIHeaders,
  defaultOptions,
  defaultSetup,
  initCookieJar,
  isRequestSuccessful,
  threshold,
  userEndpoint
} from './common.js';
import * as queries from './queries/landing.js'
import * as env from '../utils/env.js';

export const options = defaultOptions;

export function setup() {
  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie);
  
  landingTest();
}

function landingTest() {

  let testValue = env.TESTVAL;

  if (!testValue) {

    testValue = 'all';
  };

  let response;

  if (testValue == 1 || testValue == 'all' ) {

    response = http.post(userEndpoint, JSON.stringify({
      query: queries.ME,
      operationName: 'me',
    }), {
      headers: APIHeaders
    });

    isRequestSuccessful(response);

    if (response.timings.duration >= threshold ) {
  
      requestOverThreshold.add(1);
    };
  }

  if (testValue == 2 || testValue == 'all') {

    response = http.post(userEndpoint, JSON.stringify({
      query: queries.MY_USER,
      operationName: 'myUser',
    }), {
      headers: APIHeaders
    });

    isRequestSuccessful(response)

    if (response.timings.duration >= threshold ) {
  
      requestOverThreshold.add(1);
    };
  }

  if (testValue == 3 || testValue == 'all') {

    response = http.post(userEndpoint, JSON.stringify({
      query: queries.MEMBERSHIPS,
      operationName: 'memberships',
    }), {
      headers: APIHeaders
    });

    isRequestSuccessful(response)

    if (response.timings.duration >= threshold ) {
  
      requestOverThreshold.add(1);
    };
  }

  if (testValue == 4 || testValue == 6 || testValue == 'all') {

    response = http.post(userEndpoint, JSON.stringify({
      query: queries.ORG_MEMBERSHIPS,
      operationName: 'orgMemberships',
    }), {
      headers: APIHeaders
    });

    isRequestSuccessful(response);

    if (response.timings.duration >= threshold ) {

      requestOverThreshold.add(1);
    };
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
    
    isRequestSuccessful(response);

    if (response.timings.duration >= threshold ) {

      requestOverThreshold.add(1);
    };
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

    isRequestSuccessful(response);

    if (response.timings.duration >= threshold ) {

      requestOverThreshold.add(1);
    };
  }

  if (testValue == 7 || testValue == 'all') {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.GET_MY_CLASSES,
      operationName: 'myClasses',
    }), {
      headers: APIHeaders
    });

    isRequestSuccessful(response);

    if (response.timings.duration >= threshold ) {

      requestOverThreshold.add(1);
    };
  }

  if (testValue == 8 || testValue == 'all') {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.GET_PERMS,
      operationName: 'permissions',
    }), {
      headers: APIHeaders
    });

    isRequestSuccessful(response);

    if (response.timings.duration >= threshold ) {

      requestOverThreshold.add(1);
    };
  }
}