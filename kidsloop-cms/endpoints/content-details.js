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

const contentID = __ENV.contentID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentDetails(data.orgID, contentID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//default content ID refers to a single content item in testing org in loadtest-k8s environment 
export function getContentDetails(orgID, contentID = '61eee3fe1235cc9c6959e69d') {

  const response = http.get(`${CMSEndpoint}/contents/${contentID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};