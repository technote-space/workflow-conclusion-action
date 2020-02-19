/* eslint-disable no-magic-numbers */
import nock from 'nock';
import { resolve } from 'path';
import { testEnv, spyOnStdout, getOctokit, generateContext, getApiFixture, disableNetConnect, stdoutContains } from '@technote-space/github-action-test-helper';
import { Logger } from '@technote-space/github-action-helper';
import { getJobs, getJobConclusions, getWorkflowConclusion, execute } from '../src/process';

const rootDir        = resolve(__dirname, '..');
const fixtureRootDir = resolve(__dirname, 'fixtures');
const context        = generateContext({owner: 'hello', repo: 'world'});
const octokit        = getOctokit();
const logger         = new Logger();

describe('getJobs', () => {
	testEnv(rootDir);
	disableNetConnect(nock);

	it('should get jobs', async() => {
		process.env.GITHUB_RUN_ID = '123';
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/actions/runs/123/jobs')
			.reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs'));

		const jobs = await getJobs(octokit, context);

		expect(jobs).toHaveLength(1);
		expect(jobs[0]).toHaveProperty('id');
		expect(jobs[0]).toHaveProperty('status');
		expect(jobs[0]).toHaveProperty('conclusion');
	});
});

describe('getJobConclusions', () => {
	it('should get conclusions', () => {
		expect(getJobConclusions([
			{conclusion: 'cancelled'},
			{conclusion: 'skipped'},
			{conclusion: 'failure'},
			{conclusion: 'success'},
			{conclusion: 'failure'},
			{conclusion: 'success'},
			{conclusion: 'cancelled'},
			{conclusion: 'test'},
		])).toEqual([
			'cancelled',
			'skipped',
			'failure',
			'success',
			'test',
		]);
	});
});

describe('getWorkflowConclusion', () => {
	it('should get workflow conclusion', () => {
		expect(getWorkflowConclusion([])).toBe('failure');
		expect(getWorkflowConclusion([
			'skipped',
			'success',
			'cancelled',
		])).toBe('cancelled');
	});
});

describe('execute', () => {
	testEnv(rootDir);
	disableNetConnect(nock);

	it('should get payload', async() => {
		process.env.GITHUB_RUN_ID = '123';
		const mockStdout          = spyOnStdout();
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/actions/runs/123/jobs')
			.reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs'));

		await execute(logger, octokit, context);

		stdoutContains(mockStdout, [
			'::group::Jobs:',
			'::group::Conclusions:',
			JSON.stringify(['success'], null, '\t'),
			'::group::Conclusion:',
			'"success"',
			'::set-output name=conclusion::success',
			'::set-env name=WORKFLOW_CONCLUSION::success',
		]);
	});

	it('should get payload without env', async() => {
		process.env.GITHUB_RUN_ID      = '123';
		process.env.INPUT_SET_ENV_NAME = '';
		const mockStdout               = spyOnStdout();
		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/actions/runs/123/jobs')
			.reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs'));

		await execute(logger, octokit, context);

		stdoutContains(mockStdout, [
			'::group::Jobs:',
			'::group::Conclusions:',
			JSON.stringify(['success'], null, '\t'),
			'::group::Conclusion:',
			'"success"',
			'::set-output name=conclusion::success',
		]);
	});
});
