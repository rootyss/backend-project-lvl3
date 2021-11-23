import url from 'url';
import path from 'path';
import _ from 'lodash';

export const getKebabCasedLink = (link) => {
  const { host, path: linkPath } = url.parse(link);
  const name = `${host || ''}${linkPath}`.replace(/[^a-z1-9]/g, '-');
  return name.split('-').filter((i) => i).join('-');
};

export const getNameFromLink = (link, type = 'file', nameURL = '') => {
  const urlInKebabCase = getKebabCasedLink(link);
  switch (type) {
    case 'file': {
      const linkInArr = getKebabCasedLink(link).split('-');
      const urlinKebabCase = _.dropRight(linkInArr, 1).join('-');
      const ext = path.extname(link) || '.html';
      return `${nameURL}-${urlinKebabCase}${ext}`;
    }
    case 'directory': return `${urlInKebabCase}_files`;
    default: return 'none';
  }
};

export const getHtmlFileName = (link) => {
  const urlInKebabCase = getKebabCasedLink(link);
  return `${urlInKebabCase}.html`;
};
