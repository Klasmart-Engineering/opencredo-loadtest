/**
 * @namespace setup
 */
import * as env from './env.js';
import {
  check,
  fail
} from 'k6';
import { APIHeaders } from './common.js';
import http           from 'k6/http';
import { loginToB2C } from '../azure-b2c-auth/functions.js';

/**
 * function to login to AMS
 *
 * @returns {string} access token to log in to the kidsloop application
 * @memberof setup
 * @deprecated AMS no longer in use
 */
export function amsLogin() {
  const loginPay = JSON.stringify({

    email: env.USERNAME,
    pw: env.PASSWORD,
    deviceId: 'loadtest',
    deviceName: 'k6',
  });

  const loginParams = {
    headers: APIHeaders
  };

  let AmsENV = env.AMSENV;
  if (!AmsENV) {
    AmsENV = 'dev';
  }

  let amsURL;

  switch(AmsENV) {
  case 'prod':
    amsURL = 'https://ams-auth.badanamu.net';
    break;
  case 'dev':
    amsURL = 'https://auth.dev.badanamu.net';
    break;
  }

  http.options(`${amsURL}/v1/login`);

  const loginResp = http.post(`${amsURL}/v1/login`, loginPay, loginParams);

  if (
    !check(loginResp, {
      'AMS status code was 200': (r) => r.status === 200,
    })
  ) {
    console.error(JSON.stringify(loginResp));
    fail('AMS status code was *not* 200');
  }

  if (
    !check(loginResp, {
      'AMS returned an access token': (r) => r.json('accessToken') !== null,
    })
  ) {
    console.error(JSON.stringify(loginResp));
    fail('AMS did not return an access token');
  }

  return loginResp.json('accessToken');
}

/**
 * function to check the response from auth server to ensure validity of access cookie
 *
 * @borrows response as response
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof setup
 */
function checkAccessCookieResponse(response) {

  if (
    !check(response, {
      'Transfer status code was 200': (r) => r.status === 200,
    })
  ) {
    console.error(JSON.stringify(response));
    fail('Transfer status code was *not* 200');
  }

  if (
    !check(response, {
      'Transfer returned an access cookie': (r) => r.cookies.access[0],
    })
  ) {
    console.error(JSON.stringify(response));
    fail('Transfer did not return an access cookie');
  }
}

/**
 * function to login to auth and return an access cookie based on a token from AMS
 *
 * @param {string} token - an AMS access token
 * @returns {string} access cookie JWT string
 * @memberof setup
 * @deprecated - AMS no longer in use
 */
export function getAccessCookie(token) {

  const payload = JSON.stringify({
    token: token
  });

  const response = http.post(`https://auth.${env.APP_URL}/transfer`, payload, {
    headers: APIHeaders
  });

  checkAccessCookieResponse(response);

  return response.cookies.access[0].value;
}

/**
 * function to login to auth and return an access cookie based on a token from B2C
 *
 * @param {string} token - a B2C access token
 * @returns {string} access cookie JWT string
 * @memberof setup
 */
export function getAccessCookieB2C(token) {

  const authHeader = {
    Authorization: `Bearer ${token}`
  };

  const response = http.post(`https://auth.${env.APP_URL}/transfer`, null, {
    headers: Object.assign({}, APIHeaders, authHeader),
  });

  checkAccessCookieResponse(response);

  return response.cookies.access[0].value;
}

/**
 * function to check a response from user service returns a user ID
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof setup
 */
function checkUserIDResponse(response) {

  if (
    !check(response, {
      'UserID status code was 200': (r) => r.status === 200,
    })
  ) {
    console.error(JSON.stringify(response));
    fail('UserID status code was *not* 200');
  }

  if (
    !check(response, {
      'User ID value returned': (r) => r.json('data.myUser.profiles.0.id'),
    })
  ) {
    console.error(JSON.stringify(response));
    fail('No User ID value returned');
  }
}

/**
 * function to get the user ID from user service
 *
 * @param {string} token - an AMS access token
 * @param {string|undefined} [cookie=undefined] - a valid access cookie
 * @returns {string} a user ID value
 * @memberof setup
 * @deprecated - AMS no longer in use
 */
export function getUserID(token, cookie = undefined) {

  let accessCookie;
  if (cookie) {
    accessCookie = cookie;
  }
  else {
    accessCookie = getAccessCookie(token);
  }

  const response = http.post(`https://api.${env.APP_URL}/user/`, JSON.stringify({
    query: `{
      myUser {
        profiles {
          id
        }
      }
    }`
  }), {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  checkUserIDResponse(response);

  return response.json('data.myUser.profiles.0.id');
}

/**
 * function to get the user ID from user service
 *
 * @param {string} token - a B2C access token
 * @param {string|undefined} [cookie=undefined] - a valid access cookie
 * @returns {string} a user ID value
 * @memberof setup
 */
export function getUserIDB2C(token, cookie = undefined) {

  let accessCookie;
  if (cookie) {
    accessCookie = cookie;
  }
  else {
    accessCookie = getAccessCookieB2C(token);
  }

  const response = http.post(`https://api.${env.APP_URL}/user/`, JSON.stringify({
    query: `{
      myUser {
        profiles {
          id
        }
      }
    }`
  }), {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  checkUserIDResponse(response);

  return response.json('data.myUser.profiles.0.id');
}

/**
 * function to log in to the application and return a user ID to be used in k6 setup function. Can be used for AMS or B2C environments
 *
 * @param {string|undefined} [username=undefined] - username to log in to the application with. Defaults to fetching from passed env value
 * @returns {object} object containing an access cookie and user ID
 * @memberof setup
 */
export function loginSetupWithUserID(username = undefined) {

  if (env.B2C) {
    let signInName = username ? username : env.USERNAME;
    return loginSetupB2C(signInName, true);
  }
  else {
    return loginSetupAMS(true);
  }
}

/**
 * function to log in to the application to be used in k6 setup function. Can be used for AMS or B2C environments
 *
 * @returns {string} access cookie JWT
 * @memberof setup
 */
export function loginSetup() {

  if (env.B2C) {
    return loginSetupB2C();
  }
  else {
    return loginSetupAMS();
  }
}

/**
 * function to check the switch endpoint response from auth service
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof setup
 */
function checkSwitchResponse(response) {
  if (
    !check(response, {
      'Switch status code was 200': (r) => r.status === 200,
    })
  ) {
    console.error(JSON.stringify(response));
    fail('Switch status code was *not* 200');
  }

  if (
    !check(response, {
      'Switch returned an access cookie': (r) => r.cookies.access[0],
    })
  ) {
    console.error(JSON.stringify(response));
    fail('Switch did not return an access cookie');
  }
}

/**
 * function to log in to the kidsloop application using AMS to authenticate
 *
 * @param {boolean} [returnID=false] - if set to true will also return a user ID
 * @returns {string | object} either an access cookie string or an object containing an access cookie and user ID
 * @memberof setup
 * @deprecated AMS no longer in use
 */
function loginSetupAMS(returnID = false) {

  const accessToken = amsLogin();
  const accessCookie = getAccessCookie(accessToken);
  const userID = getUserID(accessToken, accessCookie);

  const switchPayload = JSON.stringify({
    user_id: userID
  });

  const switchResp = http.post(`https://auth.${env.APP_URL}/switch`, switchPayload, {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  checkSwitchResponse(switchResp);

  if (returnID) {
    return {
      cookie: switchResp.cookies.access[0].value,
      id: userID
    };
  }

  return switchResp.cookies.access[0].value;
}

/**
 * function to log in to the kidsloop application using B2C to authenticate
 *
 * @param {string} [username=undefined] - username to log in to the application with. Defaults to fetching from passed env value
 * @param {boolean} [returnID=false] - if set to true will also return a user ID
 * @returns {string | object} either an access cookie string or an object containing an access cookie and user ID
 * @memberof setup
 */
export function loginSetupB2C(username = undefined, returnID = false) {

  let signInName = username ? username : env.USERNAME;

  const loginResp = loginToB2C(signInName);
  const accessCookie = getAccessCookieB2C(loginResp.json('access_token'));
  const userID = getUserIDB2C('', accessCookie);

  const switchPayload = JSON.stringify({
    user_id: userID
  });

  const switchResp = http.post(`https://auth.${env.APP_URL}/switch`, switchPayload, {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  checkSwitchResponse(switchResp);

  if (returnID) {
    return {
      cookie: switchResp.cookies.access[0].value,
      id: userID
    };
  }

  return switchResp.cookies.access[0].value;
}

/**
 * function to fetch default organization ID for user
 *
 * @param {string} accessCookie - access cookie JWT string
 * @returns {string} organization ID
 * @memberof setup
 */
export function getOrgID(accessCookie) {

  const orgResp = http.post(`https://api.${env.APP_URL}/user/`, JSON.stringify({
    query: '{my_users { memberships { organization_id }}}',
    variables: {},
  }), {
    headers: APIHeaders,
    cookies: {
      access: {
        value: accessCookie,
        replace: true
      },
    }
  });

  return orgResp.json('data.my_users.0.memberships.0.organization_id');
}

/**
 * function to fetch a class ID from the user service
 *
 * @param {string} accessCookie - access cookie JWT string
 * @returns {string} class ID
 * @memberof setup
 */
export function getClassID(accessCookie) {

  const classResp = http.post(`https://api.${env.APP_URL}/user/`, JSON.stringify({
    query: 'query{schoolsConnection(direction:FORWARD){edges{node{classesConnection{edges{node{id}}}}}}}',
    variables: {},
  }), {
    headers: APIHeaders,
    cookies: {
      access: {
        value: accessCookie,
        replace: true
      },
    },
  });

  let classID = classResp.json('data.schoolsConnection.edges.0.node.classConnection.edges.0.node.id');
  // lots of our users have no class
  if (!classID) {
    classID = '157100c2-4936-4d08-b156-bf40c3630df0';
  }

  return classID;
}

/**
 * function to fetch a school ID from the user service
 *
 * @param {string} accessCookie - access cookie JWT string
 * @returns {string} school ID
 * @memberof setup
 */
export function getSchoolID(accessCookie) {

  const schoolResp = http.post(`https://api.${env.APP_URL}/user/`, JSON.stringify({
    query: 'query	{schoolsConnection(direction:FORWARD){edges{node{id}}}}',
    variables: {},
  }), {
    headers: APIHeaders,
    cookies: {
      access: {
        value: accessCookie,
        replace: true
      },
    },
  });

  let schoolID = schoolResp.json('data.schoolsConnection.edges.0.node.id');
  // lots of our users have no class
  if (!schoolID) {
    schoolID = 'e9c6b35d-5241-49c2-b7c5-b08bb7ff7d98';
  }

  return schoolID;
}