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
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentsResources(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getContentsResources(orgID) {

  const response = http.get(`${CMSEndpoint}/contents_resources?org_id=${orgID}&extension=pdf&partition=assets`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};