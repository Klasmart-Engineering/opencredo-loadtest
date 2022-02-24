import http from 'k6/http';
import * as env from './env.js';

const userAgent = 'k6 - open credo loadtest';

export const defaultHeaders = {
  pragma: 'no-cache',
  'user-agent': userAgent
};

export const APIHeaders = Object.assign({
  accept: 'application/json',
  'content-type': 'application/json',
}, defaultHeaders)

export function isRequestSuccessful(response, expectedStatus = 200) {

  if (response.status !== expectedStatus) {
    console.error(response.status)
    console.error(JSON.stringify(response))
    if (response.status == 502) {
      console.error(JSON.stringify(response))
    }
  }
}

export function initCookieJar(userEndpoint, accessCookieData) {
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(userEndpoint, 'access', accessCookieData);
  cookieJar.set(userEndpoint, 'locale', 'en');
  cookieJar.set(userEndpoint, 'privacy', 'true');
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