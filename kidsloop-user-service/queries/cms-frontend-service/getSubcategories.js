import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($subcategory_id_0: ID! $subcategory_id_1: ID! $subcategory_id_2: ID! $subcategory_id_3: ID! $subcategory_id_4: ID!) {
  q0: subcategory(id: $subcategory_id_0) {id name status system}
  q1: subcategory(id: $subcategory_id_1) {id name status system}
  q2: subcategory(id: $subcategory_id_2) {id name status system}
  q3: subcategory(id: $subcategory_id_3) {id name status system}
  q4: subcategory(id: $subcategory_id_4) {id name status system}
}`;

export function getSubcategories(userEndpoint, subcategoryIDs, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSubcategories',
    variables: {
      subcategory_id_0: subcategoryIDs[0],
      subcategory_id_1: subcategoryIDs[1],
      subcategory_id_2: subcategoryIDs[2],
      subcategory_id_3: subcategoryIDs[3],
      subcategory_id_4: subcategoryIDs[4]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const subcategoryIDs = ENV_DATA.categoryIDs; //TODO: Populate 'subcategoryIDs' in env-data file

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    subcategoryIDs: subcategoryIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getSubcategories(data.userEndpoint, data.subcategoryIDs, data.accessCookie, singleTest)
}