import http from 'k6/http';
import { loginSetup } from '../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../common.js';

export const options = defaultRateOptions;

const query = `query profiles {
  myUser {
    profiles {
      ...ProfileFragment
      __typename
    }
    __typename
  }
}

fragment ProfileFragment on UserConnectionNode {
  id
  givenName
  familyName
  dateOfBirth
  __typename
}`;

export function getProfiles() {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'profiles'
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

  const response = getProfiles();
  isRequestSuccessful(response);
};