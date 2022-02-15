import { coreTest }             from './tests/core.js';
import { librariesTest }        from './tests/libraries.js';
import { contentParamsTest }    from './tests/contentParams.js';
import { contentPlayTest }      from './tests/contentPlay.js';
import { contentTypeCacheTest } from './tests/contentTypeCache.js';
import { librariesAjaxTest }    from './tests/librariesAjax.js';

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<2000'] // 95% of the iteration duration below 2s
  },

  ext: {
    loadimpact: {
      projectID: 3560234,
      distribution: {
        mumbaiDistribution: {
          loadZone: 'amazon:gb:london',
          percent: 50
        },
        portlandDistribution: {
          loadZone: 'amazon:ie:dublin',
          percent: 50
        },
      }
    }
  },
}

const APP_URL = __ENV.APP_URL

//export function setup() {
  //console.log(APP_URL);
  //return loginSetup(APP_URL, USERNAME, 'dev');
//}

export default function main(data) {
  var url_root = `https://h5p.${APP_URL}`
  contentParamsTest(url_root);
  //contentPlayTest(url_root);
  //contentTypeCacheTest(url_root);
  //coreTest(url_root);
  //librariesTest(url_root);
  //librariesAjaxTest(url_root);
}