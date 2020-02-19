import { Context } from '@actions/github/lib/context';
import { setOutput, exportVariable, getInput } from '@actions/core';
import { Octokit } from '@octokit/rest';
import { Logger, Utils } from '@technote-space/github-action-helper';
import { CONCLUSIONS } from './constant';

export const getJobs = async(octokit: Octokit, context: Context): Promise<Array<Octokit.ActionsListJobsForWorkflowRunResponseJobsItem>> => octokit.paginate(
	octokit.actions.listJobsForWorkflowRun.endpoint.merge({
		...context.repo,
		'run_id': Number(process.env.GITHUB_RUN_ID),
	}),
);

export const getJobConclusions = (jobs: Array<{ conclusion: string }>): Array<string> => Utils.uniqueArray(jobs.map(job => job.conclusion));

// eslint-disable-next-line no-magic-numbers
const getLastElement = <T>(array: Array<T>): T => array.slice(-1)[0];

export const getWorkflowConclusion = (conclusions: Array<string>): string => getLastElement(CONCLUSIONS.filter(conclusion => conclusions.includes(conclusion))) ?? getLastElement(CONCLUSIONS);

export const execute = async(logger: Logger, octokit: Octokit, context: Context): Promise<void> => {
	const jobs        = await getJobs(octokit, context);
	const conclusions = getJobConclusions(jobs);
	const conclusion  = getWorkflowConclusion(conclusions);

	logger.startProcess('Jobs: ');
	console.log(jobs);

	logger.startProcess('Conclusions: ');
	console.log(conclusions);

	logger.startProcess('Conclusion: ');
	console.log(conclusion);

	setOutput('conclusion', conclusion);
	const envName = getInput('SET_ENV_NAME');
	if (envName) {
		exportVariable(envName, conclusion);
	}
};