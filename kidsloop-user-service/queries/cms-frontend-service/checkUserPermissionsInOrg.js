import http from 'k6/http';
import { getOrgID, loginSetupWithUserID } from '../../../utils/setup.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($user_id: ID!, $organization_id: ID!, $permission_name: ID!) {
  user(user_id: $user_id) {
    membership(organization_id: $organization_id) {
      checkAllowed(permission_name: $permission_name)
    }
  }
}`;

export function checkUserPermissionInOrg(orgID, userID) {
  
  return http.post(userEndpoint, JSON.stringify({
    query: query,
     variables: {
      user_id: userID,
      organization_id: orgID,
      permission_name: ENV_DATA.permissionNames[0]
     }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const loginData = loginSetupWithUserID();

  const orgID = getOrgID(loginData.cookie);

  return {
    accessCookie: loginData.cookie,
    orgID: orgID,
    userID: loginData.id
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie)

  const response = checkUserPermissionInOrg(data.orgID, data.userID);
  isRequestSuccessful(response);
}