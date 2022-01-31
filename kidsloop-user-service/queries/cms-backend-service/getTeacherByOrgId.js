import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

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

function getTeacherByOrgId(userEndpoint, orgID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'teacherByOrgId',
    variables: {
      organization_id: orgID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  }

  return getTeacherByOrgId(data.userEndpoint, data.orgID, singleTest, data.accessCookie);
};