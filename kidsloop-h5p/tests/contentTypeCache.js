import { apiHeaders }          from './envs/_shared.js';
import http                    from 'k6/http';
import { isRequestSuccessful } from '../../utils/common.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=content-type-cache

/**
 * function to test the type cache of a piece of H5P content
 *
 * @param {string} h5pEndpoint - the API endpoint for H5P
 * @param {string} token - an access cookie
 * @returns {void} Nothing
 * @memberof h5p-library
 */
export function contentTypeCacheTest(h5pEndpoint, token) {

  const url = `${h5pEndpoint}/h5p/ajax?action=content-type-cache&jwt=${token}`;

  const response = http.get(url, {
    headers: apiHeaders
  });

  isRequestSuccessful(response);
}

