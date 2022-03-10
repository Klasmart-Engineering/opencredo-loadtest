import http from 'k6/http';
import { getOrgID, loginSetup } from '../../../utils/setup.js'
import { APIHeaders, defaultRateOptions, isRequestSuccessful } from '../../../utils/common.js';
import { initUserCookieJar, userEndpoint } from '../../common.js';
import { getSubcategoriesByOrg } from './getSubcategoriesByOrg.js';

export const options = defaultRateOptions;

const query = `query ($subcategory_id_0: ID!, $subcategory_id_1: ID!, $subcategory_id_2: ID!, $subcategory_id_3: ID!, $subcategory_id_4: ID!) {
  q0: subcategory(id: $subcategory_id_0) {
    id
    name
    status
    system
  }
  q1: subcategory(id: $subcategory_id_1) {
    id
    name
    status
    system
  }
  q2: subcategory(id: $subcategory_id_2) {
    id
    name
    status
    system
  }
  q3: subcategory(id: $subcategory_id_3) {
    id
    name
    status
    system
  }
  q4: subcategory(id: $subcategory_id_4) {
    id
    name
    status
    system
  }
}`;

export function getSubcategories(subcategories) {

  return http.post(userEndpoint, JSON.stringify({
    query: query,
    variables: {
      subcategory_id_0: subcategories[0].id,
      subcategory_id_1: subcategories[1].id,
      subcategory_id_2: subcategories[2].id,
      subcategory_id_3: subcategories[3].id,
      subcategory_id_4: subcategories[4].id,
    }
  }), {
    headers: APIHeaders
  });
};

export function setup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  const subcategoryResp = getSubcategoriesByOrg(orgID);
  const subcategories = subcategoryResp.json('data.organization.subcategories');

  return {
    accessCookie: accessCookie,
    subcategories: subcategories
  };
};

export default function main(data) {

  initUserCookieJar(data.accessCookie);

  const response = getSubcategories(data.subcategories);
  isRequestSuccessful(response);
};