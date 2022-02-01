// Note: typo in 'Query' has been preserved from CMS in order to align with what we'll see in the application

import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

function getQueryMe(userEndpoint, orgID, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: `query queryMe {
      me {
        user_id
      }
    }`,
    operationName: 'queryMe',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  const accessCookie = loginSetup()
  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID:        getOrgID(accessCookie),
    singleTest:   true,
    accessCookie: accessCookie
  };
};

export default function main(data) {
  const response = getQueryMe(
    data.userEndpoint, 
    data.orgID, 
    data.accessCookie,
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}



