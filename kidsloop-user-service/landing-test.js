// import k6 specific packages
import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

// import helpers
import * as queries from './queries/landing.js';
import { loginSetup } from '../utils/setup.js'

export const options = {
  vus: 1,
  duration: '30s',

  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete below 1.5s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 3s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        mumbaiDistribution: {
          loadZone: 'amazon:in:mumbai',
          percent: 50
        },
        portlandDistribution: {
          loadZone: 'amazon:us:portland',
          percent: 50
        },
      }
    }
  }
}

const APP_URL = 'loadtest.kidsloop.live';

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};
const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function setup() {
  return loginSetup();
}

export default function main(data) {

  const userUrl = `https://api.${APP_URL}/user/`;
  let response;
  const accessCookie = data.cookies.access[0]

  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(userUrl, 'access', accessCookie.Value);
  cookieJar.set(userUrl, 'locale', 'en');
  cookieJar.set(userUrl, 'privacy', 'true');

  response = http.post(userUrl, JSON.stringify({
    query: queries.ME,
    operationName: 'me',
  }), {
    headers: APIHeaders
  });

  response = http.post(userUrl, JSON.stringify({
    query: queries.MY_USER,
    operationName: 'myUser',
  }), {
    headers: APIHeaders
  });

  response = http.post(userUrl, JSON.stringify({
    query: queries.MEMBERSHIPS,
    operationName: 'memberships',
  }), {
    headers: APIHeaders
  });

  response = http.post(userUrl, JSON.stringify({
    query: queries.ORG_MEMBERSHIPS,
    operationName: 'orgMemberships',
  }), {
    headers: APIHeaders
  });

  response = http.post(userUrl, JSON.stringify({
    query: queries.MY_USERS,
    operationName: 'myUsers',
  }), {
    headers: APIHeaders
  });

  const ID = response.json('data.my_users.0.user_id');
  const ORGID = "e89ce553-6eea-446a-ab0c-fd23aeab4c07";

  response = http.post(userUrl, JSON.stringify({
    query: queries.GET_USER_NODE,
    operationName: 'userNode',
    variables: {
      id: ID,
      organizationId: ORGID
    }
  }), {
    headers: APIHeaders
  });

  response = http.post(userUrl, JSON.stringify({
    query: queries.GET_MY_CLASSES,
    operationName: 'myClasses',
  }), {
    headers: APIHeaders
  });

  response = http.post(userUrl, JSON.stringify({
    query: queries.GET_PERMS,
    operationName: 'permissions',
  }), {
    headers: APIHeaders
  });
}