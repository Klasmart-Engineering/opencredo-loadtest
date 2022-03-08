import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getClassesByUser(userID) {
  
  return http.post(userEndpoint, JSON.stringify({
    query: `query getClassesByUser($user_id: ID!) {
      user(user_id: $user_id) {
        classesTeaching {class_id}
        classesStudying {class_id}
      }
    }`,
    operationName: 'getClassesByUser',
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
    userID:       loginData.id
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getClassesByUser(data.userID);
  isRequestSuccessful(response);
};