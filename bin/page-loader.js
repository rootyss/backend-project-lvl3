#!/usr/bin/env node
import Command from 'commander';
import pageLoader from '../src/index.js';

const pageLoaderCLI = Command;

pageLoaderCLI
  .version('1.0.0')
  .description('Page loader utility')
  .arguments('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, argv) => {
    const { output } = argv;
    pageLoader(url, output)
      .then(() => console.log(`Page loaded to ${output}`))
      .catch((error) => {
        console.error(error.message);
        console.log(output);
        process.exit(1);
      });
  });

pageLoaderCLI.parse(process.argv);
