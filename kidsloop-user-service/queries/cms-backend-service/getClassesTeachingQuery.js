import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getTeacherByOrgId } from './getTeacherByOrgId.js';
import { initCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

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

export function getClassesTeachingQuery(orgID, teacherID) {

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

  const teacherResp = getTeacherByOrgId(orgID, accessCookie);
  const teacherID = teacherResp.json('data.organization.classes.0.teachers.0.user_id');

  return {
    accessCookie: accessCookie,
    orgID: orgID,
    teacherID: teacherID
  };
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getClassesTeachingQuery(data.orgID, data.teacherID);
  isRequestSuccessful(response);
};