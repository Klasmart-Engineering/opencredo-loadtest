import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, isRequestSuccessful } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export function getOrgSchoolById(userEndpoint, orgID, schoolID, accessCookie = '', singleTest = false) {

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
  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID:        ENV_DATA.orgID,
    schoolID:     ENV_DATA.schoolID,
    accessCookie: loginSetup(),
    singleTest:   true
  };
}

export default function main(data) {
  const response = getOrgSchoolById(
    data.userEndpoint, 
    data.orgID, 
    data.schoolID,
    data.accessCookie,
    Boolean(data.singleTest));
  isRequestSuccessful(response);
  return response;
}