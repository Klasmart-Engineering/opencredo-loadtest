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

  const response = getSkills(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getSkills(orgID) {

  const response = http.get(`${CMSEndpoint}/skills?org_id=${orgID}`, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}