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

//default milestone ID refers to single milestone in testing org in loadtest-k8s environment 
const milestoneID = __ENV.milestoneID ? __ENV.milestoneID : '61eed4267a6bce688b2bd2ef';

export function setup() {

  return defaultSetup();
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getMilestoneDetails(data.orgID, milestoneID);

  return response;
};

export function getMilestoneDetails(orgID, milestoneID) {

  const response = http.get(`${CMSEndpoint}/milestones/${milestoneID}?org_id=${orgID}`, {
      headers: APIHeaders
  });

  isRequestSuccessful(response);

  if (response.timings.duration >= threshold ) {

    requestOverThreshold.add(1);
  };

  return response;
};