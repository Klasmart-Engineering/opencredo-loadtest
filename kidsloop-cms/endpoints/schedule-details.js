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

  const response = getScheduleDetails(data.orgID, scheduleID);

  return response;
};

export function getScheduleDetails(orgID, scheduleID) {

  const response = http.get(`${CMSEndpoint}/schedules/${scheduleID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};