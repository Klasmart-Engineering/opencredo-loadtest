import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query schoolsIdNameByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    schools {
      school_id
      school_name
      status
    }
  }
}`;

export function getSchoolsIdNameByOrganization(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'schoolsIdNameByOrganization',
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

  const response = getSchoolsIdNameByOrganization(data.orgID);
  isRequestSuccessful(response);
};