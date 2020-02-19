import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { Logger, Command } from '@technote-space/github-action-helper';
import { getPayload } from './utils/misc';

export const execute = async(logger: Logger, octokit: Octokit, context: Context): Promise<void> => {
	console.log(getPayload(context));

	const command = new Command(logger);
	await command.execAsync({
		command: 'ls -lat',
	});
};
