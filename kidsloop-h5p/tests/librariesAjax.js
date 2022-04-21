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
 * function to test the ajax libraries of H5P
 *
 * @param {string} h5pEndpoint - the API endpoint for H5P
 * @param {string} token - an access cookie
 * @returns {void} Nothing
 * @memberof h5p-library
 */
export function librariesAjaxTest(h5pEndpoint, token) {

  const library = chooseRandom(libraries);
  const ajaxPath = `h5p/ajax?action=libraries&machineName=${library.name}&majorVersion=${library.major}&minorVersion=${library.minor}`;

  const url = `${h5pEndpoint}/${ajaxPath}&jwt=${token}`;
  const response = http.get(url, {
    headers: apiHeaders
  });

  isRequestSuccessful(response);
}

