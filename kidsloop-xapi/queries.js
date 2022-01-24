export const SEND_EVENT = `mutation xapi($xapiEvents: [String!]!) {
  sendEvents(xAPIEvents: $xapiEvents)
}`;

