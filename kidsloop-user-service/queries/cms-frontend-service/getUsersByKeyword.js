import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query(
  $organization_id: ID!
  $keyword: String!
) {
  organization(organization_id: $organization_id) {
    findMembers(search_query: $keyword) {
      user{
        id: user_id
        name: user_name
        given_name
        family_name
        email
        avatar
      }
    }
  }
}`;

export function getUsersByKeyword(userEndpoint, orgID, keyword, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getUsersByKeyword',
    variables: {
      organization_id: orgID,
      keyword: keyword
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const orgID = ENV_DATA.orgID;
  const keyword = "Test";

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    keyword: keyword,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getUsersByKeyword(data.userEndpoint, data.orgID, data.keyword, data.accessCookie, singleTest)
}