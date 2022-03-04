import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getTeacherByOrgId } from './getTeacherByOrgId.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query classesByTeacher($user_id: ID!) {
  user(user_id: $user_id) {
    classesTeaching {
      class_id
      class_name
    }
  }
}`;

export function getClassesByTeacher(teacherID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'classesByTeacher',
    variables: {
      user_id: teacherID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {
  
  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const teacherResp = getTeacherByOrgId(orgID, accessCookie);

  const teacherID = teacherResp.json('data.organization.classes.0.teachers.0.user_id')

  return {
    accessCookie: accessCookie,
    teacherID: teacherID,
  };
}

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getClassesByTeacher(data.teacherID);
  isRequestSuccessful(response);
};