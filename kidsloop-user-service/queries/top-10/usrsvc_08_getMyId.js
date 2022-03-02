import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, initCookieJar, isRequestSuccessful } from '../../../utils/common.js';
import { userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getMyId() {

  return http.post(userEndpoint, JSON.stringify({
    query: `query getMyId {
      myUser {
        node {
          id
        }
      }
    }`,
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

  initCookieJar(userEndpoint, data.accessCookie);

  const response = getMyId();
  isRequestSuccessful(response);

  return response;
};