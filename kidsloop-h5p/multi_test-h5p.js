import {
  defaultRateOptions,
  getCurrentUserFromPool,
  getUserPool
}  from '../utils/common.js';
import { contentParamsTest }    from './tests/contentParams.js';
import { contentPlayTest }      from './tests/contentPlay.js';
import { contentTypeCacheTest } from './tests/contentTypeCache.js';
import { coreTest }             from './tests/core.js';
import { h5pEndpoint }          from './tests/envs/_shared.js';
import { librariesAjaxTest }    from './tests/librariesAjax.js';
import { librariesTest }        from './tests/libraries.js';
import { scenario }             from 'k6/execution';

/**
 * options for k6, set to default rate options
 *
 * @constant
 * @type {object}
 * @memberof h5p-library
 * @alias multiTestH5POptions
 */
export const options = defaultRateOptions;

/**
 * function for k6 to setup the multi test for H5P
 *
 * @returns {Function} User pool function
 * @memberof h5p-library
 * @alias multiTestH5PSetup
 */
export function setup() {

  return getUserPool();
}

/**
 * function for k6 to run the multi test for H5P
 *
 * @param {object} data - user pool access cookies
 * @returns {void} Nothing
 * @memberof h5p-library
 * @alias multiTestH5PMain
 */
export default function main(data) {
  const user = getCurrentUserFromPool(scenario.iterationInTest);

  // Run these one by one to obtain accurate request per second metrics
  contentParamsTest(h5pEndpoint, data[user]);
  contentPlayTest(h5pEndpoint, data[user]);
  contentTypeCacheTest(h5pEndpoint, data[user]);
  coreTest(h5pEndpoint, data[user]);
  librariesTest(h5pEndpoint, data[user]);
  librariesAjaxTest(h5pEndpoint, data[user]);
}
