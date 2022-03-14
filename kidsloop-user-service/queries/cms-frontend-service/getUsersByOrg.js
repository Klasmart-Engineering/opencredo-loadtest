import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    memberships {
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

export function getUsersByOrg(orgID, accessCookie = undefined) {

  let cookies = {};

  if (accessCookie) {
    cookies = {
      access: {
        value: accessCookie,
        replace: true
      },
    };
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders,
    cookies: cookies
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

  const response = getUsersByOrg(data.orgID);
  isRequestSuccessful(response);
};