import { resolve } from 'path';
import { testEnv, spyOnStdout, spyOnExec, testChildProcess, getOctokit, generateContext, execCalledWith, stdoutCalledWith } from '@technote-space/github-action-test-helper';
import { Logger } from '@technote-space/github-action-helper';
import { execute } from '../src/process';

const rootDir = resolve(__dirname, '..');

describe('getPayload', () => {
	testEnv(rootDir);
	testChildProcess();

	it('should get payload', async() => {
		const mockExec   = spyOnExec();
		const mockStdout = spyOnStdout();

		await execute(new Logger(), getOctokit(), generateContext({}));

		execCalledWith(mockExec, ['ls -lat']);
		stdoutCalledWith(mockStdout, [
			'{\n\t"action": ""\n}',
			'[command]ls -lat',
			'  >> stdout',
		]);
	});
});
