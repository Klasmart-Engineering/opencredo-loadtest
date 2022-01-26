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
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getAssessmentsForStudent(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getAssessmentsForStudent(orgID) {

  const response = http.get(`${CMSEndpoint}/assessments_for_student?complete_at_ge=1640252069&complete_at_le=1641461669&order_by=-complete_at&org_id=${orgID}&page=1&page_size=5&type=home_fun_study`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};