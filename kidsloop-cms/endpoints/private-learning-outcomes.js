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

  const response = getPrivateLearningOutcomes(data.orgID);

  return response;
};

//requires permissions: view_my_pending_learning_outcome_412, view_my_unpublished_learning_outcome_410, view_org_unpublished_learning_outcome_411
export function getPrivateLearningOutcomes(orgID) {

  const response = http.get(`${CMSEndpoint}/private_learning_outcomes?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};