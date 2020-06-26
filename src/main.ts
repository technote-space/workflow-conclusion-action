import {resolve} from 'path';
import {setFailed} from '@actions/core';
import {Context} from '@actions/github/lib/context';
import {Logger, ContextHelper, Utils} from '@technote-space/github-action-helper';
import {execute} from './process';

const run = async(): Promise<void> => {
  const logger  = new Logger();
  const context = new Context();
  ContextHelper.showActionInfo(resolve(__dirname, '..'), logger, context);

  await execute(logger, Utils.getOctokit(), context);
};

run().catch(error => {
  console.log(error);
  setFailed(error.message);
});
