import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { loginToB2C } from '../azure-b2c-auth/functions.js';
import * as env from './env.js';
import { getUserIDB2C, loginSetupB2C } from './setup.js';

const userAgent = 'k6 - open credo loadtest';

export const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};

export const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

const requestOverThreshold = new Counter('requests over specified threshold', false);

export function isRequestSuccessful(response, expectedStatus = 200) {

  if (response.timings.duration >= env.THRESHOLD ) {
    requestOverThreshold.add(1);
  };

  if (response.status !== expectedStatus) {
    console.error(response.status)
    console.error(JSON.stringify(response))
  }
}

export function initCookieJar(endpoint, accessCookieData) {
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(endpoint, 'access', accessCookieData);
  cookieJar.set(endpoint, 'locale', 'en');
  cookieJar.set(endpoint, 'privacy', 'true');
};

const maxVUs = (env.vus * 10) > 10000 ? 10000 : env.vus * 10; 

export const defaultRateOptions = {

  scenarios: {
    main: {
      executor: 'constant-arrival-rate',
      rate: env.rate,
      duration: env.duration,
      preAllocatedVUs: env.vus,
      maxVUs: maxVUs,
    }
  },

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 2s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        londonDistribution: {
          loadZone: 'amazon:gb:london',
          percent: 50
        },
        dublinDistribution: {
          loadZone: 'amazon:ie:dublin',
          percent: 50
        },
      }
    }
  },
};

export function getUserIDForMultiUser(iterationValue) {

  const baseNumber = 100000;

  let it = iterationValue - 1;

  if (it > 99999) {
    it = it - 99999
  }

  const userID = baseNumber + (it);

  return `loadtestuser${userID}@testdomain.com`
}

export function getUserPool(returnIDs = false) {

  let returnVal = {};
  let vus;
  
  if (env.vus >= env.poolCap) {
    vus = env.poolCap;
  }
  else {
    vus = env.vus;
  }

  for (let index = 0; index < vus; index++) {
    if (returnIDs) {
      returnVal[index] = loginSetupB2C(getUserIDForMultiUser(index + 1), true)
    }
    else {
      returnVal[index] = loginSetupB2C(getUserIDForMultiUser(index + 1))
    }
  }

  return returnVal;
}

export function getCurrentUserFromPool(num) {

  const userPoolCount = env.vus < env.poolCap ? env.vus : env.poolCap;

  const value = num % userPoolCount;
  
  if ((value - 1) < 0 ) {
    return userPoolCount - 1;
  }

  return value - 1;
};

export function getB2CTokenPool() {

  let returnVal = {};
  let vus;
  
  if (env.vus >= env.poolCap) {
    vus = env.poolCap;
  }
  else {
    vus = env.vus;
  }

  for (let index = 0; index < vus; index++) {

    let loginResp = loginToB2C(getUserIDForMultiUser(index + 1));

    let userID = getUserIDB2C(loginResp.json('access_token'));

    returnVal[index] = {
      access_token: loginResp.json('access_token'),
      id_token: loginResp.json('id_token'),
      refresh_token: loginResp.json('refresh_token'),
      user_id: userID
    }
  }

  return returnVal;
}