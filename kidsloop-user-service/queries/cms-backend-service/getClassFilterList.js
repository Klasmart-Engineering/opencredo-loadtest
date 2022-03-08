import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query getClassFilterList($filter: ClassFilter, $direction: ConnectionDirection!, $directionArgs: ConnectionsDirectionArgs){
  classesConnection(filter: $filter, direction: $direction, directionArgs: $directionArgs) {
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
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`;

export function getClassFilterList() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getClassFilterList',
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

  const response =  getClassFilterList();
  isRequestSuccessful(response);
};