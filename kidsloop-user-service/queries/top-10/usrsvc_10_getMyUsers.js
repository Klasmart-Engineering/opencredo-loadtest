import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';

export const options = defaultRateOptions

function getMyUsers(userEndpoint, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    singleTest:   true,
    accessCookie: accessCookie
  };
};

export default function main(data) {
  const response = getMyUsers(
    data.userEndpoint, 
    data.accessCookie,
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}