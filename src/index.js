import axios from 'axios';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import Listr from 'listr';
import debug from 'debug';
import { createWriteStream, promises as fs } from 'fs';
import { getHtmlFileName, getNameFromLink } from './utils.js';
import extractSourceLinks from './parser.js';

const log = debug('page-loader');

const tagsMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const changeLinksInPageToRelative = (page, dir, hostname) => {
  const $ = cheerio.load(page);
  _.keys(tagsMapping).forEach((tag) => {
    $(tag).each((index, element) => {
      const temp = $(element).attr(tagsMapping[tag]);
      if (!temp) return;
      const { host } = url.parse(temp);
      const currentTemp = temp.slice(0, temp.includes('?') ? temp.indexOf('?') : temp.length);
      if (host === hostname) {
        $(element).attr(tagsMapping[tag], path.join(dir, getNameFromLink(currentTemp, 'file', hostname)));
      }
      if (host) return;
      if (currentTemp) {
        $(element).attr(tagsMapping[tag], path.join(dir, getNameFromLink(currentTemp, 'file', hostname)));
      }
    });
  });
  return $.html();
};

const loadResource = (loadedUrl, link, outputPath, hostname) => {
  const resultFilePath = path.join(outputPath, getNameFromLink(link, 'file', hostname));

  return axios({
    method: 'get',
    url: loadedUrl,
    responseType: 'stream',
  })
    .then(({ data }) => {
      log(`Fetch resource ${loadedUrl} to ${resultFilePath}`);
      data.pipe(createWriteStream(resultFilePath));
    })
    .catch((error) => {
      log(`Fetch resource ${loadedUrl} failed ${error.message}`);
      throw error;
    });
};

export const loadResources = (loadedUrl, outputPath, page, hostname) => {
  const relativeLinks = extractSourceLinks(page);
  const resultDirName = getNameFromLink(loadedUrl, 'directory');
  const resultOutput = path.join(outputPath, resultDirName);
  return fs.mkdir(resultOutput).then(() => {
    log(`Create folder ${resultOutput} for resources`);
    return relativeLinks.map((link) => {
      const { protocol, host } = new URL(loadedUrl);
      const resourceUrl = `${protocol}//${host}${link}`;
      return {
        title: `Load ${link}`,
        task: () => loadResource(resourceUrl, link, resultOutput, hostname),
      };
    });
  })
    .then((tasks) => {
      const listr = new Listr(tasks, { concurrent: true, exitOnError: false });
      listr.run();
    })
    .catch((error) => {
      log(`Create folder ${resultOutput} failed ${error.message}`);
      throw error;
    });
};

export default (loadedUrl, outputPath) => {
  const { host: hostname } = new URL(loadedUrl);
  const sourceDir = getNameFromLink(loadedUrl, 'directory');
  return axios.get(loadedUrl)
    .then((res) => {
      log(`Load page ${loadedUrl} to ${outputPath}`);
      const resultFilePath = path.join(outputPath, getHtmlFileName(loadedUrl));

      const page = res.data;
      const newPage = changeLinksInPageToRelative(page, sourceDir, hostname);

      return { resultFilePath, newPage, res };
    })
    .then(({ resultFilePath, newPage, res }) => fs.writeFile(resultFilePath, newPage)
      .then(() => loadResources(loadedUrl, outputPath, res.data, hostname))
      .catch((error) => {
        log(`Writing to ${resultFilePath} error, ${error.message}`);
        throw error;
      }));
};
