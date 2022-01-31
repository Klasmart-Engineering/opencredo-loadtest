import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query{
    org_0: organization(organization_id: $organization_id){
        id: organization_id
        name: organization_name
        status
    }
    sch_0: school(school_id: $school_id){
        id: school_id
        name: school_name
        status
    }
}`;

export function getOrgSchoolById(userEndpoint, orgID, schoolID, accessCookie = '', singleTest = false) {
    return http.post(userEndpoint, JSON.stringify({
      query: query,
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
  const orgID = ENV_DATA.orgID;
  const schoolID = ENV_DATA.schoolID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    schoolID: schoolID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getOrgSchoolById(data.userEndpoint, data.orgID, data.schoolID, data.accessCookie, singleTest)
}