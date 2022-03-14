import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query schoolsByOrganization($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    classes {
      class_id
      class_name
      status
      schools {
        school_id
        status
      }
    }
    schools {
      school_id
      school_name
      status
      classes {
        ...classIdNameStatus
      }
    }
  }
}

fragment classIdNameStatus on Class {
  class_id
  class_name
  status
}`;

export function getSchoolsByOrganization(orgID, accessCookie = undefined) {

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
    operationName: 'schoolsByOrganization',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders,
    cookies: cookies,
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID: orgID,
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getSchoolsByOrganization(data.orgID);
  isRequestSuccessful(response);
};