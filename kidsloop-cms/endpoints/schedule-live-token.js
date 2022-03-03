import http from 'k6/http';
import { defaultRateOptions } from '../../utils/common.js';
import {
  APIHeaders,
  CMSEndpoint,
  defaultSetup,
  initCookieJar,
  isRequestSuccessful,
  requestOverThreshold,
  threshold
} from '../common.js';

export const options = defaultRateOptions;

//default schedule ID refers to single schedule in testing org in loadtest-k8s environment 
const scheduleID = __ENV.scheduleID ? __ENV.scheduleID : '61efdf2de07ca5c42f12e99d';

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getScheduleLiveToken(data.orgID, scheduleID);

  return response;
};

export function getScheduleLiveToken(orgID, scheduleID) {

  const response = http.get(`${CMSEndpoint}/schedules/${scheduleID}/live/token?live_token_type=preview&org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};