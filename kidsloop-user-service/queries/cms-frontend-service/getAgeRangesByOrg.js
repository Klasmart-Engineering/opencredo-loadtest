import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    ageRanges {
      id
      name
      status
      system
    }
  }
}`;

//requires permission: view_age_range_20112
export function getAgeRangesByOrg(orgID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
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

  initUserCookieJar(data.accessCookie);

  const response = getAgeRangesByOrg(data.orgID);
  isRequestSuccessful(response);
};