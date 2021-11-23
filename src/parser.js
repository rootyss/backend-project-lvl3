import _ from 'lodash';
import url from 'url';
import cheerio from 'cheerio';

const tagsMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const parse = (page, hostname) => {
  const links = [];
  const $ = cheerio.load(page);
  _.keys(tagsMapping).forEach((el) => {
    $(el).each((i, e) => {
      const a = $(e).attr(tagsMapping[el]);
      if (a) {
        const currentA = a.slice(0, a.includes('?') ? a.indexOf('?') : a.length);
        links.push(currentA);
      }
    });
  });
  const relativeLinks = links.filter((i) => {
    const { host } = url.parse(i);
    if (host === hostname) return true;
    console.log(host, hostname, host === hostname);
    return !host;
  });
  return relativeLinks;
};

export default parse;
