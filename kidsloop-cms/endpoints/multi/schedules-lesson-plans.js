import { scenario } from 'k6/execution';
import { defaultPoolSetup } from '../../common.js';
import { defaultRateOptions, getCurrentUserFromPool } from '../../../utils/common.js';
import { initCookieJar } from '../../common.js';
import { getScheduleLessonPlans } from '../schedules-lesson-plans.js';

export const options = defaultRateOptions;

//default teacher & class ID refers to single teacher & class in testing org in loadtest-k8s environment 
const teacherID = __ENV.teacherID ? __ENV.teacherID : '61efdf2de07ca0c6b98f0-1a68-45c8-a949-60711c0b2a505c42f12e99d';
const classID = __ENV.classID ? __ENV.classID : '8b09033d-7db9-46c3-aeb8-138c9e7eff96';


export function setup() {

  return defaultPoolSetup();
};

export default function main(data) {

  const user = getCurrentUserFromPool(scenario.iterationInTest);

  initCookieJar(data.userPool[user]);

  const response = getScheduleLessonPlans(data.orgID, teacherID, classID);

  return response;
};