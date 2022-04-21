import { contentParamsTest }    from './tests/contentParams.js';
import { contentPlayTest }      from './tests/contentPlay.js';
import { contentTypeCacheTest } from './tests/contentTypeCache.js';
import { coreTest }             from './tests/core.js';
import { defaultRateOptions }   from '../utils/common.js';
import { h5pEndpoint }          from './tests/envs/_shared.js';
import { librariesAjaxTest }    from './tests/librariesAjax.js';
import { librariesTest }        from './tests/libraries.js';
import { loginSetup }           from '../utils/setup.js';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof h5p-library
 * @alias testH5POptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the test for H5P
 *
 * @returns {Function} returns the default setup function
 * @memberof h5p-library
 * @alias testH5PSetup
 */
export function setup() {

  return loginSetup();
}

/**
 * function for k6 to run the test for H5P
 *
 * @param {object} data -result of setup function above
 * @memberof h5p-library
 * @alias testH5PMain
 */
export default function main(data) {
  // Run these one by one to obtain accurate request per second metrics
  contentParamsTest(h5pEndpoint, data.token);
  contentPlayTest(h5pEndpoint, data.token);
  contentTypeCacheTest(h5pEndpoint, data.token);
  coreTest(h5pEndpoint, data.token);
  librariesTest(h5pEndpoint, data.token);
  librariesAjaxTest(h5pEndpoint, data.token);
}
