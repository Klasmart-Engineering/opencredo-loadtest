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

const resourceID = __ENV.resourceID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentsResourcesDownload(data.orgID, resourceID);

  return response;
};

//default resource ID refers to a single resource in testing org in loadtest-k8s environment 
export function getContentsResourcesDownload(orgID, resourceID = 'assets-61eee3da7a6bce688b2bdf9a.jpeg') {

  const response = http.get(`${CMSEndpoint}/contents_resources/${resourceID}/download?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};