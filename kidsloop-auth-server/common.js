/**
 * @namespace auth-server
 */
import * as env                          from '../utils/env.js';
import { APIHeaders as importedHeaders } from '../utils/common.js';

/**
 * the default headers to use for API requests against auth server
 *
 * @constant
 * @type {object}
 * @memberof auth-server
 */
export const APIHeaders = importedHeaders;

/**
 * the endpoint for the auth server service
 *
 * @constant
 * @type {string}
 * @memberof auth-server
 */
export const AuthEndpoint = `https://auth.${env.APP_URL}`;