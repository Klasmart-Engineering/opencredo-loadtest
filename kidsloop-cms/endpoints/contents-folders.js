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

  const response = getContentsFolders(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getContentsFolders(orgID) {

  const response = http.get(`${CMSEndpoint}/contents_folders?order_by=-create_at&org_id=${orgID}&publish_status=published`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};