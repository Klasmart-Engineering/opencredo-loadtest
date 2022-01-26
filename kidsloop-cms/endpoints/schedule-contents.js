import http from 'k6/http';
import {
  APIHeaders,
  CMSEndpoint,
  defaultOptions,
  defaultSetup,
  initCookieJar,
  isRequestSuccessful,
  requestOverThreshold,
  threshold
} from '../common.js';

export const options = defaultOptions;

const scheduleID = __ENV.scheduleID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getScheduleContents(data.orgID, scheduleID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//default schedule ID refers to single schedule in testing org in loadtest-k8s environment 
export function getScheduleContents(orgID, scheduleID = '61efdf2de07ca5c42f12e99d') {

  const response = http.get(`${CMSEndpoint}/schedules/${scheduleID}/contents?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};