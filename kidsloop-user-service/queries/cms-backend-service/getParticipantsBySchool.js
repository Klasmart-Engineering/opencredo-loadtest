import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getSchoolsByOrganization } from './getSchoolsByOrganization.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query participantsBySchool($school_id: ID!) {
  school(school_id: $school_id) {
    classes {
      status
      teachers {
        user_id
        user_name
        school_memberships {
          school_id
        }
      }
      students {
        user_id
        user_name
        school_memberships {
          school_id
        }
      }
    }
  }
}`;

export function getParticipantsBySchool(schoolID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'participantsBySchool',
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

  initUserCookieJar(data.accessCookie);

  const response = getParticipantsBySchool(data.schoolID);
  isRequestSuccessful(response);
};