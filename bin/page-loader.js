#!/usr/bin/env node
import program from 'commander';
import pageLoader from '../src/index.js';

program
  .version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url) => pageLoader(url, program.opts().output)
    .then(() => console.log(`Page loaded to ${program.opts().output}`))
    .catch((error) => {
      console.log(program.opts().output, process.cwd());
      console.error(error.message);
      process.exit(1);
    }))
  .parse(process.argv);
