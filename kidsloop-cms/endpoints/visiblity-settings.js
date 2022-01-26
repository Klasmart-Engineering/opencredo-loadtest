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
}

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getVisiblitySettings(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//returns 200 but reqs perm: create_all_schools_content_224 to return data
export function getVisiblitySettings(orgID) {

  const response = http.get(`${CMSEndpoint}/visibility_settings?content_type=1&org_id=${orgID}`, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}