import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($user_id: ID!) {
  q0: user(user_id: $user_id) {
    user_id
    classesTeaching {
      class_id
      students {
        user_id
      }
    }
  }
}`;

export function batchGetClassesByUser(userID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      user_id: userID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const loginData = loginSetupWithUserID();

  return {
    accessCookie: loginData.cookie,
    userID: loginData.id
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = batchGetClassesByUser(data.userID);
  isRequestSuccessful(response);
}