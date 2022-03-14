import http from 'k6/http';
import { getOrgID, loginSetupWithUserID } from '../../../utils/setup.js';
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getSchoolsByOrg } from './getSchoolsByOrg.js';

export const options = defaultRateOptions;

const query = `query ($user_id: ID!, $school_id: ID!, $permission_name: ID!) {
  user(user_id: $user_id) {
    school_membership(school_id: $school_id) {
      checkAllowed(permission_name: $permission_name)
    }
  }
}`;

export function checkUserPermissionsInSchool(schoolID, userID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      permission_name: ENV_DATA.permissionNames[0],
      school_id: schoolID,
      user_id: userID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const loginData = loginSetupWithUserID();

  const orgID = getOrgID(loginData.cookie);

  const schoolResp = getSchoolsByOrg(orgID);
  const schoolID = schoolResp.json('data.organization.schools.0.school_id');

  return {
    accessCookie: loginData.cookie,
    schoolID: schoolID,
    userID: loginData.id
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = checkUserPermissionsInSchool(data.schoolID, data.userID);
  isRequestSuccessful(response);
};