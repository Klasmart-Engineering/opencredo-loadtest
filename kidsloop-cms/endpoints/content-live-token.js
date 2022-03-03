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

//default content ID refers to a single content item in testing org in loadtest-k8s environment 
const contentID = __ENV.contentID ? __ENV.contentID : '61eadaa60bf0d1dab16aaeb7';

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentLiveToken(data.orgID, contentID);

  return response;
};

export function getContentLiveToken(orgID, contentID) {

  const response = http.get(`${CMSEndpoint}/contents/${contentID}/live/token?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};