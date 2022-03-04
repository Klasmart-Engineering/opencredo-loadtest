import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query teacherByOrgId($organization_id: ID!) {
  organization(organization_id: $organization_id) {
    classes {
      ...classIdNameStatus
      teachers {
        ...userIdName
        school_memberships {
          school_id
        }
      }
      schools {
        school_id
      }
    }
  }
}

fragment classIdNameStatus on Class {
  class_id
  class_name
  status
}

fragment userIdName on User {
  user_id
  user_name
}`;

export function getTeacherByOrgId(orgID, accessCookie = undefined) {

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
    operationName: 'teacherByOrgId',
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
    orgID: orgID
  };
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getTeacherByOrgId(data.orgID);
  isRequestSuccessful(response);
};