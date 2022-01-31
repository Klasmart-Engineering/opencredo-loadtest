import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    programs {
      id
      name
      status
      system
    }
  }
}`;

export function getProgramsByOrg(userEndpoint, orgID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getProgramsByOrg',
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

  return getProgramsByOrg(data.userEndpoint, data.orgID, data.accessCookie, singleTest)
}