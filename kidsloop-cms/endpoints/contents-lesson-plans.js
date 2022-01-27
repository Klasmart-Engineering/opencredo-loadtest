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

const contentsLessonPlanPayload = JSON.stringify({
  group_names: [
    'Organization Content',
    'Badanamu Content',
    'More Featured Content'
  ],
  page: 1,
  page_size: 20
});

export function setup() {

  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getContentsLessonPlans(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getContentsLessonPlans(orgID) {

  const response = http.post(`${CMSEndpoint}/contents_lesson_plans?org_id=${orgID}`, contentsLessonPlanPayload, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}