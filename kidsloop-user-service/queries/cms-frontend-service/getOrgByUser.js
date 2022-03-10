import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query($user_id: ID!) {
  user(user_id: $user_id) {
    memberships{
      organization{
        id:organization_id
        name:organization_name
        status
      }
    }
  }
}`;

export function getOrgByUser(userID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
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

  const response = getOrgByUser(data.userID);
  isRequestSuccessful(response);
};