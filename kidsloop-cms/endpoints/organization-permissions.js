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

const permsPayload = JSON.stringify({
  'permission_name':[
    'create_learning_outcome_421',
    'edit_my_unpublished_learning_outcome_430',
    'edit_org_unpublished_learning_outcome_431',
    'edit_published_learning_outcome_436'
  ]
})

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

  const response = http.post(`${CMSEndpoint}/organization_permissions?org_id=${orgID}`, permsPayload, {
      headers: APIHeaders
  });
  
  isRequestSuccessful(response);

  return response;
}