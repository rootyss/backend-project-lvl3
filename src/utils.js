import axios from 'axios';
import url from 'url';

export const getStream = (link) => axios.get(link);

export const getKebabCasedLink = (link) => {
  const { host, path: linkPath } = url.parse(link);
  const name = `${host || ''}${linkPath}`.replace(/[^a-z1-9]/g, '-');
  return name.split('-').filter((i) => i).join('-');
};

export const getHtmlFileName = (link) => {
  const urlInKebabCase = getKebabCasedLink(link);
  return `${urlInKebabCase}.html`;
};
