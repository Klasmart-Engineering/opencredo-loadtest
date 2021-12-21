// import k6 specific packages
import http from 'k6/http';

// import helpers
import * as queries from './queries/landing.js';

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function landingTest(userEndpoint, accessCookieData, testValue) {

  let response;

  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(userEndpoint, 'access', accessCookieData);
  cookieJar.set(userEndpoint, 'locale', 'en');
  cookieJar.set(userEndpoint, 'privacy', 'true');

  if (testValue == 1 || testValue == 'all' ) {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.ME,
      operationName: 'me',
    }), {
      headers: APIHeaders
    });
    isRequestSuccessful(response)
  }

  if (testValue == 2 || testValue == 'all') {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.MY_USER,
      operationName: 'myUser',
    }), {
      headers: APIHeaders
    });
    isRequestSuccessful(response)
  }

  if (testValue == 3 || testValue == 'all') {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.MEMBERSHIPS,
      operationName: 'memberships',
    }), {
      headers: APIHeaders
    });
    isRequestSuccessful(response)
  }

  if (testValue == 4 || testValue == 6 || testValue == 'all')
  response = http.post(userEndpoint, JSON.stringify({
    query: queries.ORG_MEMBERSHIPS,
    operationName: 'orgMemberships',
  }), {
    headers: APIHeaders
  });
  isRequestSuccessful(response)

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
    isRequestSuccessful(response)
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
    isRequestSuccessful(response)
  }

  if (testValue == 7 || testValue == 'all') {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.GET_MY_CLASSES,
      operationName: 'myClasses',
    }), {
      headers: APIHeaders
    });
    isRequestSuccessful(response)
  }

  if (testValue == 8 || testValue == 'all') {
    response = http.post(userEndpoint, JSON.stringify({
      query: queries.GET_PERMS,
      operationName: 'permissions',
    }), {
      headers: APIHeaders
    });
    isRequestSuccessful(response)
  }
}

function isRequestSuccessful(request) {
  if (request.status !== 200) {
    console.error(request.status)
    if (request.status == 502) {
      console.error(JSON.stringify(request))
    }
  }
}