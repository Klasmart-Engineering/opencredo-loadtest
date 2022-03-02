import http from 'k6/http';
import { loginSetupWithUserID } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, initCookieJar, isRequestSuccessful } from '../../../utils/common.js';
import { userEndpoint } from '../../common.js';

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
    userID:       loginData.id,
    accessCookie: loginData.cookie,
  };
};

export default function main(data) {

  initCookieJar(userEndpoint, data.accessCookie);

  const response = getClassesByUser(data.userID);
  isRequestSuccessful(response);

  return response;
};