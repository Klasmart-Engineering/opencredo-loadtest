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
}

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getSets(data.orgID);

  return response;
};

//requires permissions: create_learning_outcome_421,edit_my_unpublished_learning_outcome_430,edit_org_unpublished_learning_outcome_431,edit_published_learning_outcome_436
export function getSets(orgID) {

  const response = http.get(`${CMSEndpoint}/sets?set_name=%27*%27&org_id=${orgID}`, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
}