import http from 'k6/http';

import { sleep } from 'k6';

// This tests that k6 is working as expected
export default function () {

  http.get('https://test.k6.io');

  sleep(1);

}