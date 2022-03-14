import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getMyUsers() {

  return http.post(userEndpoint, JSON.stringify({
    query: `query getMyUsers {
      my_users {
        user_id
        memberships {
          status
        }
      }
    }`,
    operationName: 'getMyUsers'
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

  const response = getMyUsers();
  isRequestSuccessful(response);
};