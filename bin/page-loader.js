#!/usr/bin/env node
import Command from 'commander';
import pageLoader from '../src/index.js';

const pageLoaderCLI = Command;

pageLoaderCLI
  .version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url) => {
    pageLoader(url, pageLoaderCLI.opts().output);
  });

pageLoaderCLI.parse(process.argv);
