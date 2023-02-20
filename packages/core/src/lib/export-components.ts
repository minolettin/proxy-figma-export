import * as FigmaExport from '@minolettinat/proxy-figma-export-types';

import { getClient, getPages, enrichPagesWithSvg } from './figma';

export const components: FigmaExport.ComponentsCommand = async ({
    token,
    fileId,
    version,
    onlyFromPages = [],
    filterComponent = () => true,
    transformers = [],
    outputters = [],
    concurrency = 30,
    retries = 3,
    log = (msg): void => {
        // eslint-disable-next-line no-console
        console.log(msg);
    },
}) => {
    const client = getClient(token);

    log('fetching document');
    const { data: { document = null } = {} } = await client.file(fileId, { version }).catch((error: Error) => {
        throw new Error(`while fetching file "${fileId}${version ? `?version=${version}` : ''}": ${error.message}`);
    });

    if (!document) {
        throw new Error('\'document\' is missing.');
    }

    const pages = getPages((document), { only: onlyFromPages, filter: filterComponent });

    log('preparing components');
    const pagesWithSvg = await enrichPagesWithSvg(client, fileId, pages, {
        transformers,
        concurrency,
        retries,
        onFetchCompleted: ({ index, total }) => {
            log(`fetching components ${index}/${total}`);
        },
    });

    await Promise.all(outputters.map((outputter) => outputter(pagesWithSvg)));

    log(`exported components from ${fileId}`);

    return pagesWithSvg;
};
