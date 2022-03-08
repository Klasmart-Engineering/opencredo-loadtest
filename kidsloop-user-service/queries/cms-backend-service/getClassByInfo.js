import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

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

export function getClassByInfo() {

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
    accessCookie: accessCookie
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getClassByInfo();
  isRequestSuccessful(response);
};