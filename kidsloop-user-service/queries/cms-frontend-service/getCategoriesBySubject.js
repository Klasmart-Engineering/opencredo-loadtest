import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query ($subject_id: ID!) {
  q0: subject(id: $subject_id) {
  categories {id name status system}}
}`;

export function getCategoriesBySubject(userEndpoint, subjectID, accessCookie = '', singleTest = false) {
    return http.post(userEndpoint, JSON.stringify({
      query: query,
      operationName: 'getCategoriesBySubject',
      variables: {
        subject_id: subjectID
      }
    }), {
      headers: APIHeaders
    });
}

export function setup() {

  const accessCookie = loginSetup();
  const subjectID = ENV_DATA.subjectID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    subjectID: subjectID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getCategoriesBySubject(data.userEndpoint, data.subjectID, data.accessCookie, singleTest)
}