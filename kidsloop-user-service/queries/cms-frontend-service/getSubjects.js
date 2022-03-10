import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getSubjectsByOrg } from './getSubjectsByOrg.js';

export const options = defaultRateOptions;

const query = `query ($subject_id: ID!) {
  q0: subject(id: $subject_id) {
    id
    name
    status
    system
  }
}`;

export function getSubjects(subjectID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      subject_id: subjectID
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const subjectResp = getSubjectsByOrg(orgID);
  const subjectID = subjectResp.json('data.organization.subjects.0.id');

  return {
    accessCookie: accessCookie,
    subjectID: subjectID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getSubjects(data.subjectID);
  isRequestSuccessful(response);
};