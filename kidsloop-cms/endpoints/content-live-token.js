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

  const response = getContentLiveToken(data.orgID, contentID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//default content ID refers to a single content item in testing org in loadtest-k8s environment 
export function getContentLiveToken(orgID, contentID = '61eadaa60bf0d1dab16aaeb7') {

  const response = http.get(`${CMSEndpoint}/contents/${contentID}/live/token?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};