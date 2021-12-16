import http from 'k6/http';

import { check, group, sleep, fail } from 'k6';

export const options = {

  vus: 100,

  iterations: 1000,

  thresholds: {

    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 3s
  },
};

const AMS_URL = 'https://auth.dev.badanamu.net';

const USERNAME = 'max.flintoff+testlogin@opencredo.com';

const PASSWORD = __ENV.PASSWORD;


export default () => {

  group('Login to AMS', function () {

    const loginPay = JSON.stringify({
  
      email: USERNAME,
      pw: PASSWORD,
      deviceId: "loadtest",
      deviceName: "k6",
    });
  
    const loginParams = {
      headers: {
        'content-type': 'application/json'
      }
    }
    
    http.options(`${AMS_URL}/v1/login`);
  
    const loginResp = http.post(`${AMS_URL}/v1/login`, loginPay, loginParams);
    check(loginResp, {
      'is status 200': (r) => r.status === 200,
      'has access token' : (r) => r.json('accessToken') !== '',
    });
  });

  sleep(1);
};