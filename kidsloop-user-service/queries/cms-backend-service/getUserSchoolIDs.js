import http from 'k6/http';
import { getUserID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

const query = `query userSchoolIDs($user_id: ID!) {
  user(user_id: $user_id) {
    school_memberships {
      school_id
    }
  }
}`;

function getUserSchoolIDs(userEndpoint, userID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

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
  
  const accessCookie = loginSetup();

  const userID = getUserID('', accessCookie);

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    userID: userID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getUserSchoolIDs(data.userEndpoint, data.userID, singleTest, data.accessCookie);
};