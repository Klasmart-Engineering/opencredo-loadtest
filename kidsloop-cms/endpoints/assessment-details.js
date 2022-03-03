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

const assessmentID = __ENV.assessmentID ? __ENV.assessmentID : '61fbf0fb53e200b6fe53a117';

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getAssessmentDetails(data.orgID, assessmentID);

  return response;
};

export function getAssessmentDetails(orgID, assessmentID) {

  const response = http.get(`${CMSEndpoint}/assessments/${assessmentID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};