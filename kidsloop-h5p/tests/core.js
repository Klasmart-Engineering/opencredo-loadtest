import {
  apiHeaders,
  corePaths
} from './envs/_shared.js';
import { chooseRandom }        from './_functions.js';
import http                    from 'k6/http';
import { isRequestSuccessful } from '../../utils/common.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/core/*
/**
 * function to test the core of H5P
 *
 * @param {string} h5pEndpoint - the API endpoint for H5P
 * @param {string} token - an access cookie
 * @returns {void} Nothing
 * @memberof h5p-library
 */
export function coreTest(h5pEndpoint, token) {

  const url = `${h5pEndpoint}/h5p/core/${chooseRandom(corePaths)}?jwt=${token}`;
  const response = http.get(url, {
    headers: apiHeaders
  });

  isRequestSuccessful(response);
}