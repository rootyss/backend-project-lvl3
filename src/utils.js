import url from 'url';
import path from 'path';

export const getKebabCasedLink = (link) => {
  const { host, path: linkPath } = url.parse(link);
  const name = `${host || ''}${linkPath}`.replace(/[^a-z1-9]/g, '-');
  return name.split('-').filter((i) => i).join('-');
};

export const getNameFromLink = (link, type = 'file', nameURL = '') => {
  const newLinkFile = link.includes('.') ? link.slice(0, link.lastIndexOf('.')) : link;
  const urlInKebabCase = getKebabCasedLink(link);
  switch (type) {
    case 'file': {
      const urlinKebabCase = getKebabCasedLink(newLinkFile);
      const ext = path.extname(link) || '.html';
      const resultName = `${nameURL}-${urlinKebabCase}${ext}`;
      return resultName;
    }
    case 'directory': return `${urlInKebabCase}_files`;
    default: return 'none';
  }
};

export const getHtmlFileName = (link) => {
  const urlInKebabCase = getKebabCasedLink(link);
  return `${urlInKebabCase}.html`;
};
