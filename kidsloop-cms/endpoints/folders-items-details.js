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

const folderID = __ENV.folderID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getFoldersItemsDetails(data.orgID, folderID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//default folder ID refers to single folder in testing org in loadtest-k8s environment 
export function getFoldersItemsDetails(orgID, folderID = '61eee8cf6a93400ab939883c') {

  const response = http.get(`${CMSEndpoint}/folders/items/details/${folderID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};