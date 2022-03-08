import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query getStudentNameById($filter: UserFilter) {
  usersConnection(filter: $filter, direction: FORWARD) {
    edges {
      node {
        id
        givenName
        familyName
      }
    }
  }
}`;

export function getStudentNameById() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getStudentNameById'
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

  const response = getStudentNameById();
  isRequestSuccessful(response);
};