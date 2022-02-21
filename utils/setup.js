import http from 'k6/http';
import { check, fail } from 'k6';
import { APIHeaders } from './common.js';
import * as env from './env.js';
import { loginToB2C } from '../azure-b2c-auth/functions.js';

export function amsLogin() {
  const loginPay = JSON.stringify({

    email: env.USERNAME,
    pw: env.PASSWORD,
    deviceId: "loadtest",
    deviceName: "k6",
  });

  const loginParams = {
    headers: APIHeaders
  }

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
      amsURL = 'https://auth.dev.badanamu.net'
      break;
  }

  http.options(`${amsURL}/v1/login`);

  const loginResp = http.post(`${amsURL}/v1/login`, loginPay, loginParams);

  if (
    !check(loginResp, {
      'AMS status code was 200': (r) => r.status === 200,
    })
  ) {
    fail('AMS status code was *not* 200')
  }

  if (
    !check(loginResp, {
      'AMS returned an access token': (r) => r.json('accessToken') !== null,
    })
  ) {
    fail('AMS did not return an access token')
  }

  return loginResp.json('accessToken');
}

function checkAccessCookieResponse(response) {

  if (
    !check(response, {
      'Transfer status code was 200': (r) => r.status === 200,
    })
  ) {
    console.error(JSON.stringify(response))
    fail('Transfer status code was *not* 200')
  }

  if (
    !check(response, {
      'Transfer returned an access cookie': (r) => r.cookies.access[0],
    })
  ) {
    console.error(JSON.stringify(response))
    fail('Transfer did not return an access cookie')
  }
}

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

function checkUserIDResponse(response) {

  if (
    !check(response, {
      'UserID status code was 200': (r) => r.status === 200,
    })
  ) {
    fail('UserID status code was *not* 200')
  }

  if (
    !check(response, {
      'User ID value returned': (r) => r.json('data.myUser.profiles.0.id'),
    })
  ) {
    fail('No User ID value returned')
  }
}

export function getUserID(token, cookie = undefined) {

  let accessCookie;
  if (cookie) {
    accessCookie = cookie
  }
  else {
    accessCookie = getAccessCookie(token);
  };

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

export function loginSetup() {

  if (env.B2C) {
    return loginSetupB2C();
  }
  else {
    return loginSetupAMS();
  }
}

function checkSwitchResponse(response) {
  if (
    !check(response, {
      'Switch status code was 200': (r) => r.status === 200,
    })
  ) {
    fail('Switch status code was *not* 200')
  }

  if (
    !check(response, {
      'Switch returned an access cookie': (r) => r.cookies.access[0],
    })
  ) {
    fail('Switch did not return an access cookie')
  }
}

function loginSetupAMS() {

  const accessToken = amsLogin();
  const accessCookie = getAccessCookie(accessToken);
  const userID = getUserID(accessToken, accessCookie);

  const switchPayload = JSON.stringify({
    user_id: userID
  })

  const switchResp = http.post(`https://auth.${env.APP_URL}/switch`, switchPayload, {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  checkSwitchResponse(switchResp);

  return switchResp.cookies.access[0].value;
};

export function loginSetupB2C(username = undefined) {

  let signInName = username ? username : env.USERNAME;

  const loginResp = loginToB2C(signInName);
  const accessCookie = getAccessCookieB2C(loginResp.json('access_token'));
  const userID = getUserIDB2C('', accessCookie);

  const switchPayload = JSON.stringify({
    user_id: userID
  })

  const switchResp = http.post(`https://auth.${env.APP_URL}/switch`, switchPayload, {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  checkSwitchResponse(switchResp);

  return switchResp.cookies.access[0].value;
}

export function getOrgID(accessCookie) {

  const orgResp = http.post(`https://api.${env.APP_URL}/user/`, JSON.stringify({
    query: '{\n  my_users {\n    memberships {\n      organization_id\n      status\n    }\n  }\n}',
    variables: {},
  }), {
    headers: APIHeaders,
    cookies: {
      access: accessCookie,
    }
  })

  return orgResp.json('data.my_users.0.memberships.0.organization_id');
}