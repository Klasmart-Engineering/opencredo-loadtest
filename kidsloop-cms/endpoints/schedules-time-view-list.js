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

const scheduleViewPayload = JSON.stringify({
  end_at_le: 1642636740,
  order_by: "start_at",
  page: 1,
  page_size: 20,
  start_at_ge: 1641340800,
  time_at: 0,
  time_boundary: "union",
  time_zone_offset: 0,
  view_type: "full_view",
});

export function setup() {

  return defaultSetup();
}

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getSchedulesTimeViewList(data.orgID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

export function getSchedulesTimeViewList(orgID) {

  const response = http.post(`${CMSEndpoint}/schedules_time_view/list?org_id=${orgID}`, scheduleViewPayload, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}