import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getSchoolsByOrg } from './getSchoolsByOrg.js';

export const options = defaultRateOptions;

const query = `query ($school_id: ID!) {
  q0: school(school_id: $school_id) {
    classes {
      id: class_id
      name: class_name
      status
    }
  }
}`;

export function getClassesBySchool(schoolID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
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
    schoolID: schoolID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getClassesBySchool(data.schoolID);
  isRequestSuccessful(response);
};