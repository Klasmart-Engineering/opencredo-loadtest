import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { default as getTeacherByOrgId } from './getTeacherByOrgId.js';

const query = `query getSchoolTeacher($user_id: ID!) {
  user(user_id: $user_id) {
    school_memberships {
      school {
        status
        school_id
        school_name
        organization {
          organization_id
        }
        classes {
          status
          teachers {
            ...userIdName
          }
        }
      }
    }
  }
}

fragment userIdName on User {
  user_id
  user_name
}`;

function getSchoolTeacher(userEndpoint, userID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSchoolTeacher',
    variables: {
      user_id: userID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const teacherResp = getTeacherByOrgId({
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  })

  const teacherID = teacherResp.json('data.organization.classes.0.teachers.0.user_id')

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    teacherID: teacherID,
    singleTest: true,
    accessCookie: accessCookie
  };
};

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getSchoolTeacher(data.userEndpoint, data.teacherID, singleTest, data.accessCookie);
};