import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';

export const options = defaultRateOptions;

export function getTeachersByOrg(userEndpoint, orgID) {
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
}

export function setup() {

  const accessCookie = loginSetup();

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID:        getOrgID(accessCookie),
    accessCookie: accessCookie,
    singleTest:   true
  };
}

export default function main(data) {
  const response = getTeachersByOrg(
    data.userEndpoint, 
    data.orgID);
  isRequestSuccessful(response);
  return response;
}