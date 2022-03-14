import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

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

export function getClassesConnection() {

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
    accessCookie: accessCookie
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getClassesConnection();
  isRequestSuccessful(response);
};