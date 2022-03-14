import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($user_id: ID!, $permission_name: String!) {
  user(user_id: $user_id) {
    organizationsWithPermission(permission_name: $permission_name) {
      organization {
        organization_id
        organization_name
        status
      }
    }
  }
}`;

export function getOrgByPermission(userID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      permission_name: ENV_DATA.permissionNames[0],
      user_id: userID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const loginData = loginSetupWithUserID();

  return {
    accessCookie: loginData.cookie,
    userID: loginData.id
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getOrgByPermission(data.userID);
  isRequestSuccessful(response);
};