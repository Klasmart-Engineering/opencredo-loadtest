import { coreTest }             from './tests/core.js';
import { librariesTest }        from './tests/libraries.js';
import { contentParamsTest }    from './tests/contentParams.js';
import { contentPlayTest }      from './tests/contentPlay.js';
import { contentTypeCacheTest } from './tests/contentTypeCache.js';
import { librariesAjaxTest }    from './tests/librariesAjax.js';
import {h5pEndpoint}            from "./tests/envs/_shared.js";
import { defaultRateOptions }   from '../utils/common.js';
import {loginSetup}             from "../utils/setup.js";

export const options = defaultRateOptions;

export function setup() {
  return {
    token: loginSetup()
  }
}

export default function main(data) {
  // Run these one by one to obtain accurate request per second metrics
  contentParamsTest(h5pEndpoint, data.token);
  contentPlayTest(h5pEndpoint, data.token);
  contentTypeCacheTest(h5pEndpoint, data.token);
  coreTest(h5pEndpoint, data.token);
  librariesTest(h5pEndpoint, data.token);
  librariesAjaxTest(h5pEndpoint, data.token);
}
