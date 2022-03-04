import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initCookieJar, userEndpoint } from '../../common.js';
import { getSchoolsByOrganization } from './getSchoolsByOrganization.js';

export const options = defaultRateOptions

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

export function getClassesBySchool(schoolID) {

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

  const schoolsResp = getSchoolsByOrganization(orgID, accessCookie);
  const schoolID = schoolsResp.json('data.organization.schools.0.school_id');

  return {
    accessCookie: accessCookie,
    schoolID: schoolID
  };
};

export default function main(data) {

  initCookieJar(data.accessCookie);

  const response = getClassesBySchool(data.schoolID);
  isRequestSuccessful(response);
};