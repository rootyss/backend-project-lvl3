import axios from 'axios';
import path from 'path';
import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import Listr from 'listr';
import { createWriteStream, promises as fs } from 'fs';
import { getHtmlFileName, getNameFromLink } from './utils.js';
import extractSourceLinks from './parser.js';

const tagsMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const changeLinksInPageToRelative = (page, dir) => {
  const $ = cheerio.load(page);
  _.keys(tagsMapping).forEach((tag) => {
    $(tag).each((index, element) => {
      const temp = $(element).attr(tagsMapping[tag]);
      if (!temp) return;
      const { host } = url.parse(temp);
      if (host) return;
      const currentTemp = temp.slice(0, temp.includes('?') ? temp.indexOf('?') : temp.length);
      if (currentTemp) $(element).attr(tagsMapping[tag], path.join(dir, getNameFromLink(currentTemp)));
    });
  });
  return $.html();
};

const loadResource = (loadedUrl, link, outputPath) => {
  const resultFilePath = path.join(outputPath, getNameFromLink(link));
  return axios({
    method: 'get',
    url: loadedUrl,
    responseType: 'stream',
  })
    .then(({ data }) => {
      console.log(`Fetch resource ${loadedUrl} to ${resultFilePath}`);
      data.pipe(createWriteStream(resultFilePath));
    })
    .catch((error) => {
      console.log(`Fetch resource ${loadedUrl} failed ${error.message}`);
      throw error;
    });
};

export const loadResources = (loadedUrl, outputPath, page) => {
  const relativeLinks = extractSourceLinks(page);

  const resultDirName = getNameFromLink(loadedUrl, 'directory');
  const resultOutput = path.join(outputPath, resultDirName);
  return fs.mkdir(resultOutput).then(() => {
    console.log(`Create folder ${resultOutput} for resources`);
    return relativeLinks.map((link) => {
      const { protocol, host } = new URL(loadedUrl);
      const resourceUrl = `${protocol}//${host}${link}`;
      return {
        title: `Load ${link}`,
        task: () => loadResource(resourceUrl, link, resultOutput),
      };
    });
  })
    .then((tasks) => {
      const listr = new Listr(tasks, { concurrent: true, exitOnError: false });
      listr.run();
    })
    .catch((error) => {
      console.log(`Create folder ${resultOutput} failed ${error.message}`);
      throw error;
    });
};

export default (loadedUrl, outputPath) => {
  const sourceDir = getNameFromLink(loadedUrl, 'directory');

  return axios.get(loadedUrl)
    .then((res) => {
      console.log(`Load page ${loadedUrl} to ${outputPath}`);
      const resultFilePath = path.join(outputPath, getHtmlFileName(loadedUrl));
      const page = res.data;
      const newPage = changeLinksInPageToRelative(page, sourceDir);

      return { resultFilePath, newPage, res };
    })
    .then(({ resultFilePath, newPage, res }) => fs.writeFile(resultFilePath, newPage)
      .then(() => loadResources(loadedUrl, outputPath, res.data))
      .catch((error) => {
        console.log(`Writing to ${resultFilePath} error, ${error.message}`);
        throw error;
      }));
};