import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const userAgent = 'Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';

const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};

const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

const AMS_URL = 'https://auth.dev.badanamu.net';
const APP_URL = 'loadtest.kidsloop.live';
const USERNAME = 'max.flintoff+testlogin@opencredo.com';
const PASSWORD = __ENV.PASSWORD;

export function loginSetup() {
  const loginPay = JSON.stringify({

    email: USERNAME,
    pw: PASSWORD,
    deviceId: "loadtest",
    deviceName: "k6",
  });

  const loginParams = {
    headers: APIHeaders
  }

  http.options(`${AMS_URL}/v1/login`);

  const loginResp = http.post(`${AMS_URL}/v1/login`, loginPay, loginParams);

  check(loginResp, {
    'has access token': (r) => r.json('accessToken') !== null,
    'has status 200': (r) => r.status === 200,
  });

  const authPayload = JSON.stringify({
    token: loginResp.json('accessToken')
    });

  const transferResp = http.post(`https://auth.${APP_URL}/transfer`, authPayload, {
      headers: APIHeaders
    });

  check(transferResp, {
    'has access cookie': (r) => r.cookies.access[0],
    'has refresh cookie': (r) => r.cookies.refresh[0],
    'has status 200': (r) => r.status === 200,
  });

  return transferResp;
};