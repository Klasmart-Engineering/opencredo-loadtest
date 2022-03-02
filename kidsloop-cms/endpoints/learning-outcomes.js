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

  const response = getLearningOutcomes(data.orgID);

  return response;
};

//requires permission: view_published_learning_outcome_416
export function getLearningOutcomes(orgID) {

  const response = http.get(`${CMSEndpoint}/learning_outcomes?publish_status=published&page=1&order_by=-updated_at&page_size=20&assumed=-1&org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};