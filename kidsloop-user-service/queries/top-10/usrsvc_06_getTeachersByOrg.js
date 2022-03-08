import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getTeachersByOrg(orgID) {
  
  return http.post(userEndpoint, JSON.stringify({
    query: `query getTeachersByOrg($organization_id: ID!) {
      organization(organization_id: $organization_id) {
        classes{
          teachers{
            user_id
          }
        }    
      }
    }`,
    operationName: 'getTeachersByOrg',
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
    orgID:        orgID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getTeachersByOrg(data.orgID);
  isRequestSuccessful(response);
};