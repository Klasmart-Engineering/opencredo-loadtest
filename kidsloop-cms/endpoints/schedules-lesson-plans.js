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

//default teacher & class ID refers to single teacher & class in testing org in loadtest-k8s environment 
const teacherID = __ENV.teacherID ? __ENV.teacherID : '61efdf2de07ca0c6b98f0-1a68-45c8-a949-60711c0b2a505c42f12e99d';
const classID = __ENV.classID ? __ENV.classID : '8b09033d-7db9-46c3-aeb8-138c9e7eff96';

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getScheduleLessonPlans(data.orgID, teacherID, classID);

  return response;
};

export function getScheduleLessonPlans(orgID, teacherID, classID) {

  const response = http.get(`${CMSEndpoint}/schedules_lesson_plans?teacher_id=${teacherID}&class_id=${classID}&org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};