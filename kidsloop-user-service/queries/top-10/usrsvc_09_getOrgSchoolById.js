import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';

export const options = defaultRateOptions;

export function getOrgSchoolById(userEndpoint, orgID, schoolID) {

    return http.post(userEndpoint, JSON.stringify({
      query: `query getOrgSchoolById($organization_id: ID!, $school_id: ID!) {
        organization(organization_id: $organization_id) {
          organization_id
        }
        school(school_id: $school_id) {
          school_id
        }
    }`,
      operationName: 'getOrgSchoolById',
      variables: {
        organization_id: orgID,
        school_id: schoolID
      }
    }), {
      headers: APIHeaders
    });
}

export function setup() {

  const accessCookie = loginSetup();

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID:        getOrgID(accessCookie),
    schoolID:     ENV_DATA.schoolID,
    accessCookie: accessCookie,
    singleTest:   true
  };
}

export default function main(data) {
  const response = getOrgSchoolById(
    data.userEndpoint, 
    data.orgID, 
    data.schoolID);
  isRequestSuccessful(response);
  return response;
}