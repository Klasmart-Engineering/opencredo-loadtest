/**
 * @namespace assessment-service
 */
import * as env from '../utils/env.js';

/**
 * the endpoint for the assessment service
 *
 * @constant
 * @type {string}
 * @memberof assessment-service
 */
export const assessmentEndpoint = `https://api.${env.APP_URL}/assessment/`;

/**
 * the graphql query used to test scores by user
 *
 * @constant
 * @type {string}
 * @memberof assessment-service
 */
export const query = `query ($id: String) {
  Room(room_id: $id) {
    scoresByUser {
      user {
        user_id
        given_name
        family_name
      }
      scores {
        content {
          content_id
          name
          type
          name
          h5p_id
          subcontent_id
          parent_id
        }
      }
    }
  }
}`;