import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query getUser($filter: UserFilter, $direction: ConnectionDirection!, $directionArgs: ConnectionsDirectionArgs) {
  usersConnection(direction: $direction, filter: $filter, directionArgs: $directionArgs) {
    totalCount
    edges {
      node {
        id
        givenName
        familyName
        status
        roles {
          id
          name
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

export function getUser() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getUser',
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

  initCookieJar(data.accessCookie);

  const response = getUser();
  isRequestSuccessful(response);
};