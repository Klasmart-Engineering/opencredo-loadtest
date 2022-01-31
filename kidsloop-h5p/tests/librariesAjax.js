import group from 'k6';
import http  from 'k6/http';

import { chooseRandom } from './_functions.js';
import { apiHeaders, libraries } from './envs/_shared.js';

// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/libraries/*
// GET  https://h5p.loadtest-k8s.kidsloop.live/h5p/ajax?action=libraries&machineName=FontAwesome&majorVersion=4&minorVersion=3
export function librariesAjaxTest(h5pEndpoint) {
  
    const library = chooseRandom(libraries)
    const ajaxPath = `h5p/ajax?action=libraries&machineName=${library.name}&majorVersion=${library.major}&minorVersion=${library.minor}`
    
    const url1  = `${h5pEndpoint}/${ajaxPath}`
    const response1 = http.get(url1, {
        headers: apiHeaders
    });
    if (response1.status !== 200) {
        console.error(`${response1.status}: ${url1}`)
    }
  
  }

