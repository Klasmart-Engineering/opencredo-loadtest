import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import * as env from '../../../utils/env.js';
import { APIHeaders } from '../../../utils/common.js';
import { default as getTeacherByOrgId } from './getTeacherByOrgId.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

const query = `query classesTeachingQuery($user_id: ID!, $organization_id: ID!) {
  user(user_id: $user_id) {
    membership(organization_id: $organization_id) {
      classesTeaching {
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
  }
}`;

function getClassesTeachingQuery(userEndpoint, teacherID, orgID, singleTest = false, accessCookie = '') {

  if (singleTest) {
    //initialise the cookies for this VU
    const cookieJar = http.cookieJar();
    cookieJar.set(userEndpoint, 'access', accessCookie);
    cookieJar.set(userEndpoint, 'locale', 'en');
    cookieJar.set(userEndpoint, 'privacy', 'true');
  };

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'classesTeachingQuery',
    variables: {
      organization_id: orgID,
      user_id: teacherID
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
  });

  const teacherID = teacherResp.json('data.organization.classes.0.teachers.0.user_id')
  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    teacherID: teacherID,
    orgID: orgID,
    singleTest: true,
    accessCookie: accessCookie
  };
}

export default function main(data) {

  let singleTest = data.singleTest;
  if (!singleTest) {
    singleTest = false;
  };

  return getClassesTeachingQuery(data.userEndpoint, data.teacherID, data.orgID, singleTest, data.accessCookie);
}