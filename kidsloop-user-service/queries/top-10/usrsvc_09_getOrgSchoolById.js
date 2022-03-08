import http from 'k6/http';
import { getOrgID, getSchoolID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

export function getOrgSchoolById(orgID, schoolID) {

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
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);
  const schoolID = getSchoolID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID:        orgID,
    schoolID:     schoolID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getOrgSchoolById(
    data.orgID, 
    data.schoolID
  );
  isRequestSuccessful(response);
};