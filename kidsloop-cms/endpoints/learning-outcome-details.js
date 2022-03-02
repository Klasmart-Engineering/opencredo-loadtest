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

const outcomeID = __ENV.outcomeID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getLearningOutcomeDetails(data.orgID, outcomeID);

  return response;
};

//default outcome ID refers to single outcome in testing org in loadtest-k8s environment 
export function getLearningOutcomeDetails(orgID, outcomeID = '61eadb950deabad23b938a32') {

  const response = http.get(`${CMSEndpoint}/learning_outcomes/${outcomeID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};