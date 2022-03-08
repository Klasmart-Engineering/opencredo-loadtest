import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getSchoolByPermission(permissionName, userID) {

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
};

export function setup() {

  const loginData = loginSetupWithUserID();

  return {
    accessCookie:   loginData.cookie,
    userID:         loginData.id
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getSchoolByPermission(
    ENV_DATA.permissionNames[0],
    data.userID
  );
  isRequestSuccessful(response);
};