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

const contentID = __ENV.contentID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentDetails(data.orgID, contentID);

  return response;
};

//default content ID refers to a single content item in testing org in loadtest-k8s environment 
export function getContentDetails(orgID, contentID = '61eee3fe1235cc9c6959e69d') {

  const response = http.get(`${CMSEndpoint}/contents/${contentID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};