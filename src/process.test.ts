/* eslint-disable no-magic-numbers */
import { resolve } from 'path';
import { Logger } from '@technote-space/github-action-log-helper';
import {
  testEnv,
  spyOnStdout,
  getOctokit,
  generateContext,
  getApiFixture,
  disableNetConnect,
  stdoutContains,
  getLogStdout,
  spyOnExportVariable,
  exportVariableCalledWith,
} from '@technote-space/github-action-test-helper';
import nock from 'nock';
import { describe, expect, it } from 'vitest';
import { getJobs, getJobConclusions, getWorkflowConclusion, execute } from './process';

const rootDir        = resolve(__dirname, '..');
const fixtureRootDir = resolve(__dirname, 'fixtures');
const context        = generateContext({ owner: 'hello', repo: 'world' }, {
  runId: 123,
});
const octokit        = getOctokit();
const logger         = new Logger();

describe('getJobs', () => {
  testEnv(rootDir);
  disableNetConnect(nock);

  it('should get jobs', async() => {
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/123/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs1'));

    const jobs = await getJobs(octokit, context);

    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toHaveProperty('id');
    expect(jobs[0]).toHaveProperty('status');
    expect(jobs[0]).toHaveProperty('conclusion');
  });

  it('should get jobs with input run id', async() => {
    process.env.INPUT_TARGET_RUN_ID = '456';
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/456/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs1'));

    const jobs = await getJobs(octokit, context);

    expect(jobs).toHaveLength(2);
  });
});

describe('getJobConclusions', () => {
  it('should get conclusions', () => {
    expect(getJobConclusions([
      { name: 'test1', conclusion: 'cancelled' },
      { name: 'test2', conclusion: 'neutral' },
      { name: 'test3', conclusion: 'failure' },
      { name: 'test4', conclusion: 'success' },
      { name: 'test5', conclusion: 'failure' },
      { name: 'test6', conclusion: 'success' },
      { name: 'test7', conclusion: 'cancelled' },
      { name: 'test8', conclusion: 'skipped' },
      { name: 'test9', conclusion: 'test1' },
      { name: 'test9', conclusion: 'test2' },
      { name: 'test9', conclusion: 'test3' },
    ])).toEqual([
      'cancelled',
      'neutral',
      'failure',
      'success',
      'skipped',
      'test3',
    ]);
  });
});

describe('getWorkflowConclusion', () => {
  testEnv(rootDir);

  it('should get workflow conclusion', () => {
    expect(getWorkflowConclusion([])).toBe('skipped');
    expect(getWorkflowConclusion([
      'neutral',
      'success',
      'cancelled',
    ])).toBe('cancelled');
  });

  it('should get fallback conclusion 1', () => {
    process.env.INPUT_FALLBACK_CONCLUSION = 'failure';
    expect(getWorkflowConclusion([])).toBe('failure');
  });

  it('should get fallback conclusion 2', () => {
    process.env.INPUT_FALLBACK_CONCLUSION = '';
    expect(getWorkflowConclusion([])).toBe('');
  });
});

describe('execute', () => {
  testEnv(rootDir);
  disableNetConnect(nock);

  it('should get payload 1', async() => {
    const mockStdout = spyOnStdout();
    const mockEnv    = spyOnExportVariable();
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/123/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs1'));

    await execute(logger, octokit, context);

    stdoutContains(mockStdout, [
      '::group::Jobs:',
      '::group::Conclusions:',
      getLogStdout(['success']),
      '::group::Conclusion:',
      '"success"',
      '::set-output name=conclusion::success',
    ]);
    exportVariableCalledWith(mockEnv, [
      { name: 'WORKFLOW_CONCLUSION', val: 'success' },
    ]);
  });

  it('should get payload 2', async() => {
    const mockStdout = spyOnStdout();
    const mockEnv    = spyOnExportVariable();
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/123/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs2'));

    await execute(logger, octokit, context);

    stdoutContains(mockStdout, [
      '::group::Jobs:',
      '::group::Conclusions:',
      getLogStdout(['success', 'cancelled', 'skipped']),
      '::group::Conclusion:',
      '"cancelled"',
      '::set-output name=conclusion::cancelled',
    ]);
    exportVariableCalledWith(mockEnv, [
      { name: 'WORKFLOW_CONCLUSION', val: 'cancelled' },
    ]);
  });

  it('should get payload 3', async() => {
    const mockStdout = spyOnStdout();
    const mockEnv    = spyOnExportVariable();
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/123/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs3'));

    await execute(logger, octokit, context);

    stdoutContains(mockStdout, [
      '::group::Jobs:',
      '::group::Conclusions:',
      getLogStdout(['failure', 'cancelled', 'success']),
      '::group::Conclusion:',
      '"failure"',
      '::set-output name=conclusion::failure',
    ]);
    exportVariableCalledWith(mockEnv, [
      { name: 'WORKFLOW_CONCLUSION', val: 'failure' },
    ]);
  });

  it('should get payload 4', async() => {
    const mockStdout = spyOnStdout();
    const mockEnv    = spyOnExportVariable();
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/123/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs4'));

    await execute(logger, octokit, context);

    stdoutContains(mockStdout, [
      '::group::Jobs:',
      '::group::Conclusions:',
      getLogStdout(['skipped']),
      '::group::Conclusion:',
      '"skipped"',
      '::set-output name=conclusion::skipped',
    ]);
    exportVariableCalledWith(mockEnv, [
      { name: 'WORKFLOW_CONCLUSION', val: 'skipped' },
    ]);
  });

  it('should get payload without env', async() => {
    process.env.INPUT_SET_ENV_NAME = '';
    const mockStdout               = spyOnStdout();
    nock('https://api.github.com')
      .persist()
      .get('/repos/hello/world/actions/runs/123/jobs')
      .reply(200, () => getApiFixture(fixtureRootDir, 'actions.list.jobs1'));

    await execute(logger, octokit, context);

    stdoutContains(mockStdout, [
      '::group::Jobs:',
      '::group::Conclusions:',
      getLogStdout(['success']),
      '::group::Conclusion:',
      '"success"',
      '::set-output name=conclusion::success',
    ]);
  });
});
