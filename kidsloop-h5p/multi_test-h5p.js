import { scenario }             from 'k6/execution';
import { coreTest }             from './tests/core.js';
import { librariesTest }        from './tests/libraries.js';
import { contentParamsTest }    from './tests/contentParams.js';
import { contentPlayTest }      from './tests/contentPlay.js';
import { contentTypeCacheTest } from './tests/contentTypeCache.js';
import { librariesAjaxTest }    from './tests/librariesAjax.js';
import { h5pEndpoint }          from "./tests/envs/_shared.js";
import { loginSetup }           from "../utils/setup.js";
import {
  defaultRateOptions,
  getUserPool,
  getCurrentUserFromPool
}  from '../utils/common.js';

export const options = defaultRateOptions;

export function setup() {
  const userPool = getUserPool();

  return {
    userPool: userPool
  }
}

export default function main(data) {
  const user = getCurrentUserFromPool(scenario.iterationInTest);

  // Run these one by one to obtain accurate request per second metrics
  contentParamsTest(h5pEndpoint, data.userPool[user]);
  contentPlayTest(h5pEndpoint, data.userPool[user]);
  contentTypeCacheTest(h5pEndpoint, data.userPool[user]);
  coreTest(h5pEndpoint, data.userPool[user]);
  librariesTest(h5pEndpoint, data.userPool[user]);
  librariesAjaxTest(h5pEndpoint, data.userPool[user]);
}
