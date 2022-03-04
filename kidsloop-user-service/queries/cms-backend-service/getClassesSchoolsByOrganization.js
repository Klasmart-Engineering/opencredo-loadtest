import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query classesSchoolsByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    classes {
      ...classIdNameStatus
      schools {
        school_id
        status
      }
    }
  }
}

fragment classIdNameStatus on Class {
  class_id
  class_name
  status
}`;

export function getClassesSchoolsByOrganization(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'classesSchoolsByOrganization',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID: orgID
  };
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getClassesSchoolsByOrganization(data.orgID);
  isRequestSuccessful(response);
};