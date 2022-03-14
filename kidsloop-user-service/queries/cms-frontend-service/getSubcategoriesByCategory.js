import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js';
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getSubjectsByOrg } from './getSubjectsByOrg.js';
import { getCategoriesBySubject } from './getCategoriesBySubject.js';

export const options = defaultRateOptions;

const query = `query ($category_id: ID!) {
  category(id: $category_id) {
    subcategories {
      id
      name
      status
      system
    }
  }
}`;

export function getSubcategoriesByCategory(categoryID) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      category_id: categoryID
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

  const categoryResp = getCategoriesBySubject(subjectID);
  const categoryID = categoryResp.json('data.q0.categories.0.id');

  return {
    accessCookie: accessCookie,
    categoryID: categoryID
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getSubcategoriesByCategory(data.categoryID);
  isRequestSuccessful(response);
};