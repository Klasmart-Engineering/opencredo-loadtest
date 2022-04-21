/**
 * @namespace azure-b2c
 */
import crypto   from 'k6/crypto';
import encoding from 'k6/encoding';

/**
 * function to generate a code challenge for azure B2C, used to secure authorisation code grants. [Further reading]{@link https://docs.microsoft.com/en-us/azure/active-directory-b2c/authorization-code-flow#1-get-an-authorization-code}
 *
 * @returns {object} object containing verifier and challenge for B2C auth
 * @memberof azure-b2c
 */
export function generateCodeChallenge() {

  const verifier = encoding.b64encode(crypto.randomBytes(32), 'rawurl');

  const challenge = crypto.sha256(verifier, 'base64rawurl');

  return {
    verifier: verifier,
    challenge: challenge
  };
}