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

export function setup() {

  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getSchedulesFeedbacks(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getSchedulesFeedbacks(orgID) {

  const response = http.get(`${CMSEndpoint}/schedules_feedbacks?org_id=${orgID}`, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}