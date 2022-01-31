import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';

export const query = `query ($category_id_0: ID! $category_id_1: ID! $category_id_2: ID! $category_id_3: ID! $category_id_4: ID!) {
  q0: category(id: $category_id_0) {id name status system}
  q1: category(id: $category_id_1) {id name status system}
  q2: category(id: $category_id_2) {id name status system}
  q3: category(id: $category_id_3) {id name status system}
  q4: category(id: $category_id_4) {id name status system}
}`;

export function getCategories(userEndpoint, categoryIDs, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getCategories',
    variables: {
      category_id_0: categoryIDs[0],
      category_id_1: categoryIDs[1],
      category_id_2: categoryIDs[2],
      category_id_3: categoryIDs[3],
      category_id_4: categoryIDs[4]
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const categoryIDs = ENV_DATA.categoryIDs;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    categoryIDs: categoryIDs,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getCategories(data.userEndpoint, data.categoryIDs, data.accessCookie, singleTest)
}