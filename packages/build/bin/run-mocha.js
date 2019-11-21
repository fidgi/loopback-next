#!/usr/bin/env node
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-mocha

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  const mochaOpts = argv.slice(2);

  const setMochaOpts =
    !utils.isOptionSet(
      mochaOpts,
      '--config', // mocha 6.x
      '--opts', // legacy
      '--package', // mocha 6.x
      '--no-config', // mocha 6.x
    ) && !utils.mochaConfiguredForProject();

  // Add default options
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  if (setMochaOpts) {
    // Use the default `.mocharc.json` from `@loopback/build`
    const mochaOptsFile = utils.getConfigFile('.mocharc.json');
    mochaOpts.unshift('--config', mochaOptsFile);
  }

  const allowConsoleLogsIx = mochaOpts.indexOf('--allow-console-logs');
  if (allowConsoleLogsIx === -1) {
    // Fail any tests that are printing to console.
    mochaOpts.unshift(
      '--no-warnings', // Disable node.js warnings
      '--require',
      require.resolve('../src/fail-on-console-logs'),
    );
  } else {
    // Allow tests to print to console, remove --allow-console-logs argument
    mochaOpts.splice(allowConsoleLogsIx, 1);
  }

  const resolveFromProjectFirstIx = mochaOpts.indexOf('--resolve-from-project');
  let resolveFromProjectFirst = false;
  if (resolveFromProjectFirstIx !== -1) {
    mochaOpts.splice(resolveFromProjectFirstIx, 1);
    resolveFromProjectFirst = true;
  }

  const args = [...mochaOpts];

  return utils.runCLI('mocha/bin/mocha', args, {
    // Prefer to use the `mocha` version from `@loopback/build`
    // For example, `coveralls@3.0.8` installs mocha@5.x at root level and it
    // does not honor `--config` for `.mocharc.json`. The build hangs as `--exit`
    // is not passed to `mocha`.
    //
    // npm ls mocha
    // loopback-next@0.1.0
    // └─┬ coveralls@3.0.8
    // └─┬ cobertura-parse@1.0.5
    // └── mocha@5.0.5
    resolveFromProjectFirst,
    ...options,
  });
}

module.exports = run;
if (require.main === module) run(process.argv);
