"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.getWorkflowConclusion = exports.getJobConclusions = exports.getJobs = exports.getTargetRunId = void 0;
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const constant_1 = require("./constant");
const getTargetRunId = (context) => /^\d+$/.test((0, core_1.getInput)('TARGET_RUN_ID')) ? Number((0, core_1.getInput)('TARGET_RUN_ID')) : context.runId;
exports.getTargetRunId = getTargetRunId;
const getJobs = async (octokit, context) => octokit.paginate(octokit.rest.actions.listJobsForWorkflowRun, {
    ...context.repo,
    'run_id': (0, exports.getTargetRunId)(context),
});
exports.getJobs = getJobs;
const getJobConclusions = (jobs) => github_action_helper_1.Utils.uniqueArray(Object.values(jobs
    .filter(job => null !== job.conclusion)
    .map(job => ({ name: job.name, conclusion: String(job.conclusion) }))
    .reduce((acc, job) => ({ ...acc, [job.name]: job.conclusion }), {})));
exports.getJobConclusions = getJobConclusions;
// eslint-disable-next-line no-magic-numbers
const getWorkflowConclusion = (conclusions) => { var _a; return (_a = constant_1.CONCLUSIONS.filter(conclusion => conclusions.includes(conclusion)).slice(-1)[0]) !== null && _a !== void 0 ? _a : (0, core_1.getInput)('FALLBACK_CONCLUSION'); };
exports.getWorkflowConclusion = getWorkflowConclusion;
const execute = async (logger, octokit, context) => {
    const jobs = await (0, exports.getJobs)(octokit, context);
    const conclusions = (0, exports.getJobConclusions)(jobs);
    const conclusion = (0, exports.getWorkflowConclusion)(conclusions);
    logger.startProcess('Jobs: ');
    console.log(jobs);
    logger.startProcess('Conclusions: ');
    console.log(conclusions);
    logger.startProcess('Conclusion: ');
    console.log(conclusion);
    (0, core_1.setOutput)('conclusion', conclusion);
    const envName = (0, core_1.getInput)('SET_ENV_NAME');
    if (envName) {
        (0, core_1.exportVariable)(envName, conclusion);
    }
};
exports.execute = execute;