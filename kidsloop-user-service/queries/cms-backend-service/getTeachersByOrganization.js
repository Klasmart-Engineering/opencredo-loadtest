import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

// Note: typo in 'Organization' has been preserved from CMS in order to align with what we'll see in the application
const query = `query teachersByOrgnization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    teachers {
      user {
        user_id
        user_name
      }
    }
  }
}`;

export function getTeachersByOrganization(orgID) {

  // Note: typo in 'Organization' has been preserved from CMS in order to align with what we'll see in the application
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'teachersByOrgnization',
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

  initCookieJar(data.accessCookie);

  const response = getTeachersByOrganization(data.orgID);
  isRequestSuccessful(response);
};