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

const teacherID = __ENV.teacherID
const classID = __ENV.classID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getScheduleLessonPlans(data.orgID, teacherID, classID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//default teacher & class ID refers to single teacher & class in testing org in loadtest-k8s environment 
export function getScheduleLessonPlans(orgID, teacherID = '61efdf2de07ca0c6b98f0-1a68-45c8-a949-60711c0b2a505c42f12e99d', classID = '8b09033d-7db9-46c3-aeb8-138c9e7eff96') {

  const response = http.get(`${CMSEndpoint}/schedules_lesson_plans?teacher_id=${teacherID}&class_id=${classID}&org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};