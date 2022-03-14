import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    grades {
      id
      name
      status
      system
    }
  }
}`;

// requires permission: view_grades_20113
export function getGradesByOrg(orgID, accessCookie = undefined) {

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
}

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID: orgID
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie)

  const response =  getGradesByOrg(data.orgID);
  isRequestSuccessful(response);
}