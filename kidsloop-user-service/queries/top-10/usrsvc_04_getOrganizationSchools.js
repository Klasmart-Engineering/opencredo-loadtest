import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';

export const options = defaultRateOptions;

export function getSchoolsConnection(userEndpoint) {
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
}

export function setup() {
  return {
    userEndpoint:   `https://api.${env.APP_URL}/user/`,
    accessCookie:   loginSetup(),
    singleTest:     true
  };
}

export default function main(data) {
  const response = getSchoolsConnection(data.userEndpoint);
  isRequestSuccessful(response);
  return response;
}