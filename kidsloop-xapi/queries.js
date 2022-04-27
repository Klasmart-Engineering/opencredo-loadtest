/**
 * The graphql query to send to the xapi server
 *
 * @constant
 * @memberof xapi-server
 */
export const SEND_EVENT = `mutation xapi($xapiEvents: [String!]!) {
  sendEvents(xAPIEvents: $xapiEvents)
}`;