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

const milestoneID = __ENV.milestoneID

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getMilestoneDetails(data.orgID, milestoneID);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };
};

//default milestone ID refers to single milestone in testing org in loadtest-k8s environment 
export function getMilestoneDetails(orgID, milestoneID = '61eed4267a6bce688b2bd2ef') {

  const response = http.get(`${CMSEndpoint}/milestones/${milestoneID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  return response;
};