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

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentsPrivate(data.orgID);

  return response;
};

//returns 403 'undefined permission'
export function getContentsPrivate(orgID) {

  const response = http.get(`${CMSEndpoint}/contents_private?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};