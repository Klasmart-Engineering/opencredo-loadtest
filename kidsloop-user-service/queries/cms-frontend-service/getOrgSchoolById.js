import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getSchoolsByOrg } from './getSchoolsByOrg.js';

export const options = defaultRateOptions;

const query = `query getOrgSchoolById($organization_id: ID!, $school_id: ID!) {
  org_0: organization(organization_id: $organization_id) {
    id: organization_id
    name: organization_name
    status
  }
  sch_0: school(school_id: $school_id) {
    id: school_id
    name: school_name
    status
  }
}`;

export function getOrgSchoolById(orgID, schoolID) {

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
};

export function setup() {

  const accessCookie = loginSetup();
  
  const orgID = getOrgID(accessCookie);

  const schoolResp = getSchoolsByOrg(orgID);
  const schoolID = schoolResp.json('data.organization.schools.0.school_id');

  return {
    accessCookie: accessCookie,
    orgID: orgID,
    schoolID: schoolID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getOrgSchoolById(data.orgID, data.schoolID);
  isRequestSuccessful(response);
};