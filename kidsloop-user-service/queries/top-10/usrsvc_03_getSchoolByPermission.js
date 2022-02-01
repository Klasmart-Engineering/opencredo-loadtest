import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export function getSchoolByPermission(userEndpoint, userID, permissionName, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: `query getSchoolByPermission($user_id: ID!, $permission_name: String!) {
      user(user_id: $user_id) {
        schoolsWithPermission(permission_name: $permission_name) {
          school_id
          school {
            organization {
              organization_id
            }
          }
        }
      }
    }`,
    operationName: 'getSchoolByPermission',
    variables: {
      user_id: userID,
      permission_name: permissionName
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {
  return {
    userEndpoint:   `https://api.${env.APP_URL}/user/`,
    userID:         ENV_DATA.userID,
    permissionName: ENV_DATA.permissionNames[0],
    accessCookie:   loginSetup(),
    singleTest:     true
  };
}

export default function main(data) {
  const response = getSchoolByPermission(
    data.userEndpoint, 
    data.userID, 
    data.permissionName, 
    data.accessCookie, 
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}