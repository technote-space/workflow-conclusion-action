import path from 'path';
import { setFailed } from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { Logger, ContextHelper, Utils } from '@technote-space/github-action-helper';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { TARGET_EVENTS } from './constant';
import { execute } from './process';

const run = async(): Promise<void> => {
	const logger  = new Logger();
	const context = new Context();
	ContextHelper.showActionInfo(path.resolve(__dirname, '..'), logger, context);

	if (!isTargetEvent(TARGET_EVENTS, context)) {
		logger.info('This is not target event.');
		return;
	}

	await execute(logger, Utils.getOctokit(), context);
};

run().catch(error => {
	console.log(error);
	setFailed(error.message);
});
