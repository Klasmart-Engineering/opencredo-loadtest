import http from 'k6/http';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { loginSetupWithUserID } from '../../../utils/setup.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query userSchoolIDs($user_id: ID!) {
  user(user_id: $user_id) {
    school_memberships {
      school_id
    }
  }
}`;

export function getUserSchoolIDs(userID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'userSchoolIDs',
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

  const response = getUserSchoolIDs(data.userID);
  isRequestSuccessful(response);
};