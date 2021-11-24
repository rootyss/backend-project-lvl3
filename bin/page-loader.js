#!/usr/bin/env node
import program from 'commander';
import pageLoader from '../src/index.js';

program
  .version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => pageLoader(url, options.output = process.cwd())
    .then((outputPath) => console.log(`Page loaded to ${outputPath}`))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    }))
  .parse(process.argv);
