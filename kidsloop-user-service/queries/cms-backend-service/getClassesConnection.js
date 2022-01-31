import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

const query = `query classesConnection($classFilter: ClassFilter, $classCursor: String, $teacherFilter: UserFilter, $teacherCursor: String) {
  classesConnection(direction: FORWARD, filter: $classFilter, directionArgs: {cursor: $classCursor}) {
    totalCount
    edges {
      node {
        id
        name
        status
        schools {
          userStatus
          id
          name
        }
        teachersConnection(direction: FORWARD, filter: $teacherFilter, cursor: $teacherCursor) {
          totalCount
          edges {
            node {
              id
              givenName
              familyName
              status
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

function getClassesConnection(userEndpoint, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'classesConnection'
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getClassesConnection(data.userEndpoint, singleTest, data.accessCookie);
};