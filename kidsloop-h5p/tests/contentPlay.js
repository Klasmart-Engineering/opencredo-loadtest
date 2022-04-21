import {apiHeaders}            from './envs/_shared.js';
import {APP_URL}               from '../../utils/env.js';
import {chooseRandom}          from './_functions.js';
import {contentIds}            from './envs/_contentIds.js';
import http                    from 'k6/http';
import { isRequestSuccessful } from '../../utils/common.js';

// GET  /h5p/play/:contentId
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/play/61e5ab9293c3e70013dfa9a

/**
 * function to test the playing of a piece of H5P content
 *
 * @param {string} h5pEndpoint - the API endpoint for H5P
 * @param {string} token - an access cookie
 * @returns {void} Nothing
 * @memberof h5p-library
 */
export function contentPlayTest(h5pEndpoint, token) {

  const url = `${h5pEndpoint}/h5p/play/${chooseRandom(contentIds[APP_URL])}?jwt=${token}`;

  const response = http.get(url, {
    headers: apiHeaders
  });

  const cfCache = response.headers['X-Cache'];
  if (cfCache != 'Hit from cloudfront') {
    console.log(cfCache);
  }

  isRequestSuccessful(response);
}