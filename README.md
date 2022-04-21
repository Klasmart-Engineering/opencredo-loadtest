# Open Credo Load Testing

This repository contains a collection of loadtesting scripts written with [k6](https://k6.io/) and associated tooling.

## Details

The majority of files in this repository are load tests written in k6 that are intended to be run with large amounts of virtual users to understand the scale limits in the application. As well as these tests there is tooling for running them in an automated event driven load testing platform.

Code is documented using [JSDoc](https://jsdoc.app/index.html) and [Closure Types](https://github.com/google/closure-compiler/wiki/Types-in-the-Closure-Type-System). JSDocs are using namespaces to provide better readability. Update docs before pushing changes with `npm run docs`

Key tools used:

- [k6](https://k6.io/docs/)
- [AWS Codebuild](https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html)
- [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [New Relic](https://docs.newrelic.com/)

## Contents

Subfolders are organised by kidsloop service with additional folders where some code or configuration doesn't belong to a specific service. 

The service folders contain tests alongside npm package.json and webpack configuration which allow the tests to be compiled to single files in order to run them at larger scales. This works as it allows the use of a mode in k6 that prevents the internal babel transpiler from running, in turn increasing performance: [Further reading](https://k6.io/docs/testing-guides/running-large-tests#compatibility-mode-base)

`utils/` also contains k6 code but it is generic functions that are imported and used across the service folders.

`mocks/` contains configuration for [MockServer](https://www.mock-server.com/) to allow mocking some of the graphql services. Due to the nature of these services this configuration will not work out of the box in new environments and is here as a reference only.

`platform/` contains code related to the automated event driven load test platform

`poc/` TODO

There is an additional file `generate_statsd_config.sh` that is used as part of the load testing automation platform. It allows for customised configuration of the [New Relic statsd integration](https://docs.newrelic.com/docs/infrastructure/host-integrations/host-integrations-list/statsd-monitoring-integration-version-2/) that is utilised by the codebuild tests.

## Running Tests

The tests aim to follow a standard of setting default variables as much as possible, as well as fetching data from within the setup function as much as possible. That being said anything that requires being set can be set with [k6 environment variables](https://k6.io/docs/using-k6/environment-variables/)

This means most tests can be run setting these values as below:
```sh
k6 run -e PASSWORD=<PASSWORD> -e USERNAME=<STUDENT_USER> -e LOGIN_URL=loadtest.kidsloop.live -e APP_URL=kidskube-loadtest.kidsloop.live -e duration=10m -e rate=50 -e vus=50 -e B2C=true kidsloop-user-service/queries/getProfiles.js
```

Environment variables are configured with defaults in `utils/env.js` where it's a value that will be used across multiple tests. Otherwise can be set in code as follows:
```js
const contentID = __ENV.contentID ? __ENV.contentID : '61eee3fe1235cc9c6959e69d';
```

## New test creation

To add a new test in an existing service the easiest way is to copy an existing test and change the main function
```js
export default function main(data) {
  //NEW CODE HERE
}
```
this is the function called by k6 when executing tests. It is important to establish the access cookie in this code if you are testing a part of the system that requires you to be logged in in order to ensure correct results.

A number of helper functions can be imported from `utils/` to aid in setup and data collection. For example you can include a function to check if the request was the expected status code and log the body if not. 

```js
import { isRequestSuccessful } from '../utils/common.js';

// then you pass the response object to this function

export default function main(data) {
  ...

  const response =  getQueryMe(data.orgID);
  isRequestSuccessful(response);
  
  ...
}
```

Another example of using one of the helper functions in the setup part of the test. This one prevents you having to write custom logic to log in to the application

```js

import { getOrgID, loginSetup } from '../../../utils/setup.js';

export function setup() {
  
  // run helper login function & getOrgID functions
  const accessCookie = loginSetup();
  const orgID = getOrgID(accessCookie);

  return {
    accessCookie: accessCookie,
    orgID: orgID
  };
};

```

these values would then be accessible in the main function like so:

```js
export default function main(data) {

  const accessCookie = data.accessCookie;
  const orgID = data.orgID;
  ...
}
```
