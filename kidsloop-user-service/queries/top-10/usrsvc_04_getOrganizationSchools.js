import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export function getSchoolsConnection(userEndpoint, accessCookie = '', singleTest = false) {
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
  const response = getSchoolsConnection(
    data.userEndpoint, 
    data.accessCookie, 
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}