import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, initCookieJar, isRequestSuccessful } from '../../../utils/common.js';
import { userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getQueryMe() {

  return http.post(userEndpoint, JSON.stringify({
    query: `query queryMe {
      me {
        user_id
      }
    }`,
    operationName: 'queryMe'
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

  const response = getQueryMe();
  isRequestSuccessful(response);

  return response;
};



