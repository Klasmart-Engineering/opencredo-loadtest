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

//default resource ID refers to a single resource in testing org in loadtest-k8s environment 
const resourceID = __ENV.resourceID ? __ENV.resourceID : 'assets-61eee3da7a6bce688b2bdf9a.jpeg';

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentsResourcesDownload(data.orgID, resourceID);

  return response;
};

export function getContentsResourcesDownload(orgID, resourceID) {

  const response = http.get(`${CMSEndpoint}/contents_resources/${resourceID}/download?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};