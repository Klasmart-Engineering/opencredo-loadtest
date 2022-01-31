// Note: typo in 'Organization' has been preserved from CMS in order to align with what we'll see in the application

import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';

const query = `query roleBasedUsersByOrgnization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    roles {
      role_name
      memberships {
        user {
          user_id
          user_name
        }
      }
    }
  }
}`;

function getRoleBasedUsersByOrgnization(userEndpoint, orgID, accessCookie = '', singleTest = false) {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'roleBasedUsersByOrgnization',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    accessCookie: accessCookie,
    singleTest: true
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  }

  return getRoleBasedUsersByOrgnization(data.userEndpoint, data.orgID, data.accessCookie, singleTest);
};