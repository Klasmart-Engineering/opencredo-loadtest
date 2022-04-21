import {
  apiHeaders,
  libraries
} from './envs/_shared.js';
import { chooseRandom }        from './_functions.js';
import http                    from 'k6/http';
import { isRequestSuccessful } from '../../utils/common.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/libraries/*
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=libraries&machineName=FontAwesome&majorVersion=4&minorVersion=3
/**
 * function to test the libraries of H5P
 *
 * @param {string} h5pEndpoint - the API endpoint for H5P
 * @param {string} token - an access cookie
 * @returns {void} Nothing
 * @memberof h5p-library
 */
export function librariesTest(h5pEndpoint, token) {

  const library = chooseRandom(libraries);
  const libraryPath = `h5p/libraries/${library.name}-${library.major}.${library.minor}/library.json`;
  const url2 = `${h5pEndpoint}/${libraryPath}?jwt=${token}`;
  const response2 = http.get(url2, {
    headers: apiHeaders
  });

  isRequestSuccessful(response2);
}

