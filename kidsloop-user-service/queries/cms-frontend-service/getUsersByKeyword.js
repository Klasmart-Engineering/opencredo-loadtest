import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($organization_id: ID!, $keyword: String!) {
  organization(organization_id: $organization_id) {
    findMembers(search_query: $keyword) {
      user {
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

//requires permission: view_users_40110
export function getUsersByKeyword(orgID, keyword = "Test") {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      organization_id: orgID,
      keyword: keyword
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

  const response = getUsersByKeyword(data.orgID);
  isRequestSuccessful(response);

  console.log(response.body)
};