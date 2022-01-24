import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query orgs($orgIDs: [ID!]){
  organizations(organization_ids: $orgIDs){
    id: organization_id
    name: organization_name
    status
  }
}`;

export function getOrgs(userEndpoint, orgIDs, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getOrgs',
    variables: {
      orgIDs: orgIDs
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const orgIDs = [ENV_DATA.orgID];

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgIDs: orgIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getOrgs(data.userEndpoint, data.orgIDs, data.accessCookie, singleTest)
}