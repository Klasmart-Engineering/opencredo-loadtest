import http from 'k6/http';
import { check, fail } from 'k6';

const userAgent = 'Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';

const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};

const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

const PASSWORD = __ENV.PASSWORD;

export function loginSetup(APP_URL, USERNAME, AmsENV = 'dev') {
  const loginPay = JSON.stringify({

    email: USERNAME,
    pw: PASSWORD,
    deviceId: "loadtest",
    deviceName: "k6",
  });

  const loginParams = {
    headers: APIHeaders
  }

  let AMS_URL;
  switch(AmsENV) {
    case 'prod':
      AMS_URL = 'https://auth.dev.badanamu.net';
      break;
    case 'dev':
      AMS_URL = 'https://auth.dev.badanamu.net'
      break;
  }

  http.options(`${AMS_URL}/v1/login`);

  const loginResp = http.post(`${AMS_URL}/v1/login`, loginPay, loginParams);

  if (
    !check(loginResp, {
      'has status 200': (r) => r.status === 200,
    })
  ) {
    fail('AMS status code was *not* 200')
  }

  if (
    !check(loginResp, {
      'has access token': (r) => r.json('accessToken') !== null,
    })
  ) {
    fail('AMS did not return an access token')
  }

  const authPayload = JSON.stringify({
    token: loginResp.json('accessToken')
    });

  const transferResp = http.post(`https://auth.${APP_URL}/transfer`, authPayload, {
      headers: APIHeaders
    });

  if (
    !check(transferResp, {
      'has status 200': (r) => r.status === 200,
    })
  ) {
    fail('Transfer status code was *not* 200')
  }

  if (
    !check(transferResp, {
      'has access cookie': (r) => r.cookies.access[0],
    })
  ) {
    fail('Transfer did not return an access cookie')
  }

  const accessCookie = transferResp.cookies.access[0].value


  const userIDResp = http.post(`https://api.${APP_URL}/user/`, JSON.stringify({
    query: '{\n  my_users {\n    user_id\n  }\n}'
  }), {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  if (
    !check(userIDResp, {
      'has status 200': (r) => r.status === 200,
    })
  ) {
    fail('UserID status code was *not* 200')
  }

  if (
    !check(userIDResp, {
      'has user ID value': (r) => r.json('data.my_users.0.user_id'),
    })
  ) {
    fail('No User ID value returned')
  }

  const userID = userIDResp.json('data.my_users.0.user_id')

  const switchPayload = JSON.stringify({
    user_id: userID
  })

  const switchResp = http.post(`https://auth.${APP_URL}/switch`, switchPayload, {
    headers: APIHeaders,
    cookies: {
      access: accessCookie
    }
  });

  if (
    !check(switchResp, {
      'has status 200': (r) => r.status === 200,
    })
  ) {
    fail('Switch status code was *not* 200')
  }

  if (
    !check(switchResp, {
      'has access cookie': (r) => r.cookies.access[0],
    })
  ) {
    fail('Switch did not return an access cookie')
  }

  return switchResp.cookies.access[0].value;
};