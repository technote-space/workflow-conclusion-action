"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const constant_1 = require("./constant");
exports.getJobs = (octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    return octokit.paginate(octokit.actions.listJobsForWorkflowRun.endpoint.merge(Object.assign(Object.assign({}, context.repo), { 'run_id': Number(process.env.GITHUB_RUN_ID) })));
});
exports.getJobConclusions = (jobs) => github_action_helper_1.Utils.uniqueArray(Object.values(jobs
    .filter(job => null !== job.conclusion)
    .map(job => ({ name: job.name, conclusion: String(job.conclusion) }))
    .reduce((acc, job) => (Object.assign(Object.assign({}, acc), { [job.name]: job.conclusion })), {})));
// eslint-disable-next-line no-magic-numbers
const getLastElement = (array) => array.slice(-1)[0];
exports.getWorkflowConclusion = (conclusions) => { var _a; return (_a = getLastElement(constant_1.CONCLUSIONS.filter(conclusion => conclusions.includes(conclusion)))) !== null && _a !== void 0 ? _a : getLastElement(constant_1.CONCLUSIONS); };
exports.execute = (logger, octokit, context) => __awaiter(void 0, void 0, void 0, function* () {
    const jobs = yield exports.getJobs(octokit, context);
    const conclusions = exports.getJobConclusions(jobs);
    const conclusion = exports.getWorkflowConclusion(conclusions);
    logger.startProcess('Jobs: ');
    console.log(jobs);
    logger.startProcess('Conclusions: ');
    console.log(conclusions);
    logger.startProcess('Conclusion: ');
    console.log(conclusion);
    core_1.setOutput('conclusion', conclusion);
    const envName = core_1.getInput('SET_ENV_NAME');
    if (envName) {
        core_1.exportVariable(envName, conclusion);
    }
});
