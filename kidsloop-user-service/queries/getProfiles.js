import http from 'k6/http';
import { loginSetup } from '../../utils/setup.js';
import { APIHeaders, isRequestSuccessful } from '../../utils/common.js';
import { defaultOptions, userEndpoint } from '../common.js';

export const options = defaultOptions

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

function getProfiles(singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  const resp = getProfiles(singleTest, data.accessCookie);

  isRequestSuccessful(resp);

  return resp;
};