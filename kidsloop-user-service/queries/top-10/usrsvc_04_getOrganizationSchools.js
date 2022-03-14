import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getSchoolsConnection() {

  return http.post(userEndpoint, JSON.stringify({
    query: `query getSchoolsConnection {
      schoolsConnection(direction: FORWARD) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            name
            status
            shortCode
          }
        }
      }
    }`,
    operationName: 'getSchoolsConnection',
    variables: {
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

  const response = getSchoolsConnection();
  isRequestSuccessful(response);
};