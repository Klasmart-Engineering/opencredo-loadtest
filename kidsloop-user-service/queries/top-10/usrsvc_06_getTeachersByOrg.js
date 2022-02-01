import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export function getTeachersByOrg(userEndpoint, orgID, accessCookie = '', singleTest = false) {
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
  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID:        ENV_DATA.orgID,
    accessCookie: loginSetup(),
    singleTest:   true
  };
}

export default function main(data) {
  const response = getTeachersByOrg(
    data.userEndpoint, 
    data.orgID, 
    data.accessCookie,
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}