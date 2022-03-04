import { sleep } from 'k6';
import http from 'k6/http';
import * as env from '../utils/env.js';
import uuid from '../utils/uuid.js';
import { Counter } from 'k6/metrics';
import { APIHeaders, initCookieJar, isRequestSuccessful } from '../utils/common.js';
import { getOrgID, loginSetup } from '../utils/setup.js';

export const CMSEndpoint = `https://${env.CMS_PREFIX}.${env.APP_URL}/v1`;

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

export function prerender(accessCookie, pdfEndpoint, pdfFileName) {
  let response;

  initCookieJar(accessCookie);

  response = http.get(
    `${pdfEndpoint}/${pdfFileName}/prerender`,
    {
      headers: APIHeaders
    }
  )
  isRequestSuccessful(response, 202);
}