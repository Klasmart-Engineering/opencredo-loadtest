import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query organizations {
  organizations {
    organization_id
    organization_name
  }
}`;

export function getOrganizations() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'organizations'
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

  const response = getOrganizations();
  isRequestSuccessful(response);
};