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

  const response = getAssessmentsForStudent(data.orgID);

  return response;
};

export function getAssessmentsForStudent(orgID) {

  const response = http.get(`${CMSEndpoint}/assessments_for_student?complete_at_ge=1640252069&complete_at_le=1641461669&order_by=-complete_at&org_id=${orgID}&page=1&page_size=5&type=home_fun_study`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};