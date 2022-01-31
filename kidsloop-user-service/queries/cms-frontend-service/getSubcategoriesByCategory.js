import http from 'k6/http';
import { loginSetup } from '../../../utils/setup.js'
import * as env from '../../../utils/env.js'
import { ENV_DATA } from '../../../utils/env-data-loadtest-k8s.js'
import { APIHeaders } from '../../../utils/common.js';
import { defaultOptions } from '../../common.js';

export const options = defaultOptions

export const query = `query($category_id: ID!) {
  category(id: $category_id) {
    subcategories {
      id
      name
      status
      system
    }
  }
}`;

export function getSubcategoriesByCategory(userEndpoint, categoryID, accessCookie = '', singleTest = false) {
  return http.post(userEndpoint, JSON.stringify({
    query: query,
    operationName: 'getSubcategoriesByCategory',
    variables: {
      category_id: categoryID
    }
  }), {
    headers: APIHeaders
  });
}

export function setup() {

  const accessCookie = loginSetup();
  const categoryID = ENV_DATA.categoryID;

  return {
    userEndpoint: `https://api.${env.APP_URL}/user/`,
    categoryID: categoryID,
    accessCookie: accessCookie,
    singleTest: true
  };
}

export default function main(data) {

  let singleTest = data.singleTest
  if (!singleTest) {
    singleTest = false
  }

  return getSubcategoriesByCategory(data.userEndpoint, data.categoryID, data.accessCookie, singleTest)
}