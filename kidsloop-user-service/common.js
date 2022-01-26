import http from 'k6/http';
import * as env from '../utils/env.js';
import { Counter } from 'k6/metrics';
import { APIHeaders as importedHeaders } from '../utils/common.js';
import { loginSetup } from '../utils/setup.js';

export const APIHeaders = importedHeaders;

export const userEndpoint = `https://api.${env.APP_URL}/user/`;

export const defaultOptions = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<3000'] // 95% of the iteration duration below 2s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        mumbaiDistribution: {
          loadZone: 'amazon:gb:london',
          percent: 50
        },
        portlandDistribution: {
          loadZone: 'amazon:ie:dublin',
          percent: 50
        },
      }
    }
  },
};

export const requestOverThreshold = new Counter('requests over specified threshold', false);

export const threshold = env.THRESHOLD ? env.THRESHOLD : 1000;

export function defaultSetup() {

  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie
  }
};

export function initCookieJar(accessCookieData) {
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(userEndpoint, 'access', accessCookieData);
  cookieJar.set(userEndpoint, 'locale', 'en');
  cookieJar.set(userEndpoint, 'privacy', 'true');
};

export function isRequestSuccessful(request) {
  if (request.status !== 200) {
    console.error(request.status)
    console.error(JSON.stringify(request))
  }
};