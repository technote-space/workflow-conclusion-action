"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const core_1 = require("@actions/core");
const context_1 = require("@actions/github/lib/context");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const github_action_log_helper_1 = require("@technote-space/github-action-log-helper");
const process_1 = require("./process");
const run = async () => {
    const logger = new github_action_log_helper_1.Logger();
    const context = new context_1.Context();
    github_action_helper_1.ContextHelper.showActionInfo(path_1.resolve(__dirname, '..'), logger, context);
    await process_1.execute(logger, github_action_helper_1.Utils.getOctokit(), context);
};
run().catch(error => {
    console.log(error);
    core_1.setFailed(error.message);
});
