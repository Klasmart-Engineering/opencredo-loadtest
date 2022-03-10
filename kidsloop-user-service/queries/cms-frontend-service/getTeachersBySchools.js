import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getSchoolsByOrg } from './getSchoolsByOrg.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($school_id_0: ID!, $school_id_1: ID!, $school_id_2: ID!) {
  q0: school(school_id: $school_id_0) {
    classes {
      teachers {
        id: user_id
        name: user_name
      }
    }
  }
  q1: school(school_id: $school_id_1) {
    classes {
      teachers {
        id: user_id
        name: user_name
      }
    }
  }
  q2: school(school_id: $school_id_2) {
    classes {
      teachers {
        id: user_id
        name: user_name
      }
    }
  }
}`;

export function getTeachersBySchools(schoolIDs) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      school_id_0: schoolIDs[0].school_id,
      school_id_1: schoolIDs[1].school_id,
      school_id_2: schoolIDs[2].school_id
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();
  
  const orgID = getOrgID(accessCookie);

  const schoolResp = getSchoolsByOrg(orgID);
  const schoolIDs = schoolResp.json('data.organization.schools');

  return {
    accessCookie: accessCookie,
    schoolIDs: schoolIDs
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getTeachersBySchools(data.schoolIDs);
  isRequestSuccessful(response);
};