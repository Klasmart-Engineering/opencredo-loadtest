/**
 * @namespace user-service
 */
import * as env   from '../utils/env.js';
import {
  APIHeaders as importedHeaders,
  initCookieJar
} from '../utils/common.js';
import { loginSetup } from '../utils/setup.js';

/**
 * the default headers to use for API requests against user sevice
 *
 * @constant
 * @type {object}
 * @memberof user-service
 */
export const APIHeaders = importedHeaders;

/**
 * the endpoint for the user service
 *
 * @constant
 * @type {string}
 * @memberof user-service
 */
export const userEndpoint = `https://api.${env.APP_URL}/user/`;

/**
 * function to act as a generic setup for any tests in this folder
 *
 * @returns {object} object containing the access cookie, returned as an object for consistency in approach
 * @memberof user-service
 */
export function defaultSetup() {

  const accessCookie = loginSetup();

  return {
    accessCookie: accessCookie
  };
}

/**
 * function to initalise a cookie jar for the user endpoint directly
 *
 * @param {string} accessCookieData - a valid access cookie JWT
 * @returns {void} Nothing
 * @memberof user-service
 */
export function initUserCookieJar(accessCookieData) {

  initCookieJar(userEndpoint, accessCookieData);
}