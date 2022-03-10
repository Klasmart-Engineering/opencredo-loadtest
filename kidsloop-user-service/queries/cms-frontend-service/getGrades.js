import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { getGradesByOrg } from './getGradesByOrg.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';

export const options = defaultRateOptions;

const query = `query ($grade_id: ID!) {
  q0: grade(id: $grade_id) {
    id
    name
    status
    system
  }
}`;

export function getGrades(gradeID) {

  let grade_id = gradeID;

  //set a default as most users won't be able to get the gradeID in setup
  if (!grade_id) {
    grade_id = 'd7e2e258-d4b3-4e95-b929-49ae702de4be';
  }

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      grade_id: grade_id
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const gradesResp = getGradesByOrg(orgID);
  const gradeID = gradesResp.json('.data.organization.grades.0.id');

  return {
    accessCookie: accessCookie,
    gradeID: gradeID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getGrades(data.gradeID);
  isRequestSuccessful(response);
};