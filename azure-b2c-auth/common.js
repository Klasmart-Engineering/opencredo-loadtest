import * as env from '../utils/env.js';
import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

export const defaultOptions = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    iteration_duration: ['p(95)<4000'] // 95% of the iteration duration below 4s
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
};

export function generateCodeChallenge() {

  const verifier = encoding.b64encode(crypto.randomBytes(32), 'rawurl')

  const challenge = crypto.sha256(verifier, 'base64rawurl');

  return {
    verifier: verifier,
    challenge: challenge
  };
};