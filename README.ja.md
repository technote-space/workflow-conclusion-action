# Workflow Conclusion Action

[![CI Status](https://github.com/technote-space/workflow-conclusion-action/workflows/CI/badge.svg)](https://github.com/technote-space/workflow-conclusion-action/actions)
[![codecov](https://codecov.io/gh/technote-space/workflow-conclusion-action/branch/master/graph/badge.svg)](https://codecov.io/gh/technote-space/workflow-conclusion-action)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/workflow-conclusion-action/badge)](https://www.codefactor.io/repository/github/technote-space/workflow-conclusion-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/workflow-conclusion-action/blob/master/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

これはワークフローの結果を取得するための`GitHub Actions`です。

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [使用方法](#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)
  - [Success](#success)
  - [Failure](#failure)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 使用方法
例：Lint => Test => Publish (タグ付与時のみ) => slack (いずれかのジョブが失敗した場合のみ)
```yaml
on: push

name: CI

jobs:
  lint:
    name: ESLint
    runs-on: ubuntu-latest
    ...

  test:
    name: Coverage
    needs: lint
    strategy:
      matrix:
        node: ['11', '12']
    ...

  publish:
    name: Publish Package
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    ...

  slack:
    name: Slack
    needs: publish # set needs only last job except this job
    runs-on: ubuntu-latest
    if: always() # set always
    steps:
        # run this action to get workflow conclusion
        # You can get conclusion by env (env.WORKFLOW_CONCLUSION)
      - uses: technote-space/workflow-conclusion-action@v1
      - uses: 8398a7/action-slack@v2
        with:
          # status: ${{ env.WORKFLOW_CONCLUSION }} # neutral, success, cancelled, timed_out, failure
          status: failure
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: env.WORKFLOW_CONCLUSION == 'failure' # notify only if failure
```

### Success
![Success](https://raw.githubusercontent.com/technote-space/workflow-conclusion-action/images/success.png)

すべてのジョブが正常だったため、Slackアクションはスキップされます。

### Failure
![Failure](https://raw.githubusercontent.com/technote-space/workflow-conclusion-action/images/failure.png)

いくつかのジョブがスキップされた場合でもSlackアクションは実行されます。

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
