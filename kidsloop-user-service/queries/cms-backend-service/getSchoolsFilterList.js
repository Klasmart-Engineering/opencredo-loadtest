import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query getSchoolsFilterList($filter: SchoolFilter, $direction: ConnectionDirection!, $directionArgs: ConnectionsDirectionArgs) {
  schoolsConnection(filter: $filter, direction: $direction, directionArgs: $directionArgs) {
    totalCount
    edges {
      cursor
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}`;

export function getSchoolsFilterList() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSchoolsFilterList',
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

  const response = getSchoolsFilterList();
  isRequestSuccessful(response);
};