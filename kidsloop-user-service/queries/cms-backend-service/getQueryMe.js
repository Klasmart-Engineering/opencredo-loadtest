import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

// Note: typo in 'Query' has been preserved from CMS in order to align with what we'll see in the application
const query = `query qeuryMe($organization_id: ID!) {
  me {
    ...userIdName
    membership(organization_id: $organization_id) {
      roles {
        permissions {
          permission_name
        }
      }
    }
  }
}

fragment userIdName on User {
  user_id
  user_name
}`;

export function getQueryMe(orgID) {

// Note: typo in 'Query' has been preserved from CMS in order to align with what we'll see in the application
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'qeuryMe',
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
    accessCookie: accessCookie,
    orgID: orgID
  };
};

export default function main(data) {
  
  initUserCookieJar(data.accessCookie)

  const response =  getQueryMe(data.orgID);
  isRequestSuccessful(response);
};