import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query classesByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    classes {
      class_id
      class_name
      status
      schools {
        school_id
        school_name
      }
      teachers {
        user_id
        user_name
      }
      students {
        user_id
        user_name
      }
    }
  }
}`;

export function getClassesByOrganization(orgID, accessCookie = undefined) {

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
    operationName: 'classesByOrganization',
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

  initUserCookieJar(data.accessCookie)

  const response = getClassesByOrganization(data.orgID);
  isRequestSuccessful(response);
};