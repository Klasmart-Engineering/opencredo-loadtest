import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

const query = `query getClassByInfo($filter: ClassFilter, $direction: ConnectionDirection!, $studentFilter: UserFilter, $teacherFilter: UserFilter, $studentCursor: String, $studentDirection: ConnectionDirection, $teacherCursor: String, $teacherDirection: ConnectionDirection) {
  classesConnection(filter: $filter, direction: $direction) {
    edges {
      cursor
      node {
        id
        name
        studentsConnection(filter: $studentFilter, cursor: $studentCursor, direction: $studentDirection) {
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
        teachersConnection(filter: $teacherFilter, cursor: $teacherCursor, direction: $teacherDirection) {
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
  }
}`;

function getClassByInfo(userEndpoint, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getClassByInfo',
    variables: {
      direction: "FORWARD"
    }
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

  return getClassByInfo(data.userEndpoint, singleTest, data.accessCookie);
};