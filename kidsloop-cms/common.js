/**
 * @namespace cms-backend
 */
import * as env from '../utils/env.js';
import {
  getOrgID,
  loginSetup
} from '../utils/setup.js';
import {
  getUserPool,
  APIHeaders as importedHeaders
} from '../utils/common.js';
import { Counter } from 'k6/metrics';
import http        from 'k6/http';

/**
 * the default headers to use for API requests against CMS
 *
 * @constant
 * @type {object}
 * @memberof cms-backend
 */
export const APIHeaders = importedHeaders;

/**
 * the endpoint for the CMS backend service
 *
 * @constant
 * @type {string}
 * @memberof cms-backend
 */
export const CMSEndpoint = `https://${env.CMS_PREFIX}.${env.APP_URL}/v1`;

/**
 * @constant
 * @deprecated use {@link common.exports.isRequestSuccessful} instead of loading manually
 * @memberof cms-backend
 */
export const requestOverThreshold = new Counter('requests over specified threshold', false);

/**
 * @constant
 * @deprecated use {@link common.exports.isRequestSuccessful} instead of loading manually
 * @memberof cms-backend
 */
export const threshold = env.THRESHOLD ? env.THRESHOLD : 1000;

/**
 * function that always returns an access cookie with an organization ID as this is required by every endpoint in CMS
 *
 * @returns {object} object containing access cookie and organization ID
 * @memberof cms-backend
 */
export function defaultSetup() {

  const accessCookie = loginSetup();

  const orgID = getOrgID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID: orgID
  };
}

/**
 * function that always returns a pool of access cookies with an organization ID as this is required by every endpoint in CMS
 *
 * @returns {object} object containing pool of access cookies and organization ID
 * @memberof cms-backend
 */
export function defaultPoolSetup() {

  const userPool = getUserPool();

  const orgID = getOrgID(userPool[0]);

  return {
    userPool: userPool,
    orgID: orgID
  };
}

/**
 * function to initalise a cookie jar for the CMS endpoint directly
 *
 * @param {string} accessCookieData - a valid access cookie JWT
 * @returns {void} Nothing
 * @memberof cms-backend
 */
export function initCookieJar(accessCookieData) {
  //initialise the cookies for this VU
  const cookieJar = http.cookieJar();
  cookieJar.set(CMSEndpoint, 'access', accessCookieData);
  cookieJar.set(CMSEndpoint, 'locale', 'en');
  cookieJar.set(CMSEndpoint, 'privacy', 'true');
}

/**
 * function to check a response object for success criteria
 *
 * @param {object} response - a k6/http response object
 * @returns {void} Nothing
 * @memberof cms-backend
 * @deprecated use {@link common.exports.isRequestSuccessful}
 */
export function isRequestSuccessful(response) {
  if (response.status !== 200) {
    console.error(response.status);
    console.error(JSON.stringify(response));
  }
}