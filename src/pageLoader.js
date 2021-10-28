import fsp from 'fs/promises';
import path from 'path';
import { getStream, getHtmlFileName } from './utils.js';

export default (loadedUrl, outputPath) => {
  const stream = getStream(loadedUrl);

  stream.then((response) => {
    const resultFilePath = path.join(outputPath, getHtmlFileName(loadedUrl));
    const page = response.data;
    return { resultFilePath, page };
  })
    .then(({ resultFilePath, page }) => {
      console.log(resultFilePath);
      return fsp.writeFile(resultFilePath, page)
        .catch((error) => {
          console.log(`Writing to ${resultFilePath} error, ${error.message}`);
          throw error;
        });
    });
};
