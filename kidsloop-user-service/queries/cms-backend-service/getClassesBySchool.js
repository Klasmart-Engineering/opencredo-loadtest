import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { default as getSchoolsByOrganization } from './getSchoolsByOrganization.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

const query = `query classesBySchool($school_id: ID!) {
  school(school_id: $school_id) {
    classes {
      ...classIdNameStatus
      schools {
        school_id
        school_name
      }
      teachers {
        ...userIdName
      }
      students {
        ...userIdName
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

function getClassesBySchool(userEndpoint, schoolID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'classesBySchool',
    variables: {
      school_id: schoolID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const schoolsResp = getSchoolsByOrganization({
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  });

  const schoolID = schoolsResp.json('data.organization.schools.0.school_id');

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    schoolID: schoolID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getClassesBySchool(data.userEndpoint, data.schoolID, singleTest, data.accessCookie);
};