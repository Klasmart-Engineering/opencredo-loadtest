import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query getMyId {
  myUser {
    node {
      id
      familyName
      givenName
      schoolMembershipsConnection(direction: FORWARD) {
        edges {
          node {
            school {
              id
              name
            }
          }
        }
      }
    }
  }
}`;

export function getMyId() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getMyId'
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

  const response = getMyId();
  isRequestSuccessful(response);
};