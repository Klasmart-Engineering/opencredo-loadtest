import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, initCookieJar, isRequestSuccessful } from '../../../utils/common.js';
import { userEndpoint } from '../../common.js';

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

  return {
    orgID:        getOrgID(accessCookie),
    accessCookie: accessCookie,
  };
};

export default function main(data) {

  initCookieJar(userEndpoint, data.accessCookie);

  const response = getTeachersByOrg(data.orgID);
  isRequestSuccessful(response);

  return response;
};