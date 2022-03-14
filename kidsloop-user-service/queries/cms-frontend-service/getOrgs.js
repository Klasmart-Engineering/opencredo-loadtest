import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query orgs($orgIDs: [ID!]) {
  organizations(organization_ids: $orgIDs) {
    id: organization_id
    name: organization_name
    status
  }
}`;

export function getOrgs(orgIDs) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      orgIDs: orgIDs
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
    orgIDs: orgID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getOrgs(data.orgIDs)
  isRequestSuccessful(response);
};