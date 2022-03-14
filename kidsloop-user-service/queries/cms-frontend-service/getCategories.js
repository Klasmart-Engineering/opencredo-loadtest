import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getCategoriesBySubject } from './getCategoriesBySubject.js';
import { getSubjectsByOrg } from './getSubjectsByOrg.js';

export const options = defaultRateOptions;

const query = `query ($category_id_0: ID!, $category_id_1: ID!, $category_id_2: ID!, $category_id_3: ID!, $category_id_4: ID!) {
  q0: category(id: $category_id_0) {
    id
    name
    status
    system
  }
  q1: category(id: $category_id_1) {
    id
    name
    status
    system
  }
  q2: category(id: $category_id_2) {
    id
    name
    status
    system
  }
  q3: category(id: $category_id_3) {
    id
    name
    status
    system
  }
  q4: category(id: $category_id_4) {
    id
    name
    status
    system
  }
}`;

export function getCategories(categories) {
  
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      category_id_0: categories[0].id,
      category_id_1: categories[1].id,
      category_id_2: categories[2].id,
      category_id_3: categories[3].id,
      category_id_4: categories[4].id
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const subjectResp = getSubjectsByOrg(orgID);
  const subjectID = subjectResp.json('data.organization.subjects.0.id');

  const categoryResp = getCategoriesBySubject(subjectID);
  const categories = categoryResp.json('data.q0.categories');

  return {
    accessCookie: accessCookie,
    categories: categories
  };
}

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getCategories(data.categories);
  isRequestSuccessful(response);
}