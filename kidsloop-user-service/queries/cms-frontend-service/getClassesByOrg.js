import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($organization_id: ID!) {
  q0: organization(organization_id: $organization_id) {
    classes{id: class_id name: class_name status}
  }
}`;

export function getClassesByOrg(userEndpoint, orgID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getClassesByOrg',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const orgID = ENV_DATA.orgID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getClassesByOrg(data.userEndpoint, data.orgID, data.accessCookie, singleTest)
}