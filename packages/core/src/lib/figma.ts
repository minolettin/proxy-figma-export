import * as Figma from '@minolettinat/proxy-figma-js';
import { basename, dirname } from 'path';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import * as FigmaExport from '@figma-export/types';

import {
    toArray,
    fetchAsSvgXml,
    promiseSequentially,
    fromEntries,
    chunk,
    emptySvg,
} from './utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloneDeep = require('lodash.clonedeep');

const getComponents = (
    children: readonly Figma.Node[] = [],
    filter: FigmaExport.ComponentFilter = () => true,
): FigmaExport.ComponentNode[] => {
    let components: FigmaExport.ComponentNode[] = [];

    children.forEach((node) => {
        if (node.type === 'COMPONENT' && filter(node)) {
            components.push({
                ...node,
                svg: '',
                figmaExport: {
                    id: node.id,
                    dirname: dirname(node.name),
                    basename: basename(node.name),
                },
            });
        }

        if (node.type === 'COMPONENT_SET' && filter(node)) {
            const variantsWithNewNames: {
                -readonly [key in keyof Figma.Component]: Figma.Component[key];
            }[] = cloneDeep(node.children);
            variantsWithNewNames.forEach((child) => {
                const regexMatches = /(?<==)(\d+|[a-zA-Z]+)/gm[Symbol.match](child.name)?.map((match) => match.toLowerCase());
                if (regexMatches?.[1] === 'light') {
                    // eslint-disable-next-line no-param-reassign,max-len
                    child.name = `${node.name}_${regexMatches?.[0]}px`;
                } else {
                    // eslint-disable-next-line no-param-reassign,max-len
                    child.name = `${node.name}_${regexMatches?.[0]}_${regexMatches?.[1]}`;
                }
            });
            components = [
                ...components,
                ...getComponents((variantsWithNewNames), filter),
            ];
        }

        if ('children' in node && node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') {
            components = [
                ...components,
                ...getComponents((node.children), filter),
            ];
        }
    });

    return components;
};

const filterPagesByName = (pages: readonly Figma.Canvas[], pageNames: string | string[] = []): Figma.Canvas[] => {
    const only = toArray(pageNames).filter((p) => p.length);
    return pages.filter((page) => only.length === 0 || only.includes(page.name));
};

type GetPagesOptions = {
    only?: string | string[];
    filter?: FigmaExport.ComponentFilter;
}

const getPages = (document: Figma.Document, options: GetPagesOptions = {}): FigmaExport.PageNode[] => {
    const pages = filterPagesByName(document.children as Figma.Canvas[], options.only);

    return pages
        .map((page) => ({
            ...page,
            components: getComponents(page.children as readonly FigmaExport.ComponentNode[], options.filter),
        }))
        .filter((page) => page.components.length > 0);
};

const getIdsFromPages = (pages: FigmaExport.PageNode[]): string[] => pages.reduce((ids: string[], page) => [
    ...ids,
    ...page.components.map((component) => component.id),
], []);

const getClient = (token: string): Figma.ClientInterface => {
    if (!token) {
        throw new Error('\'Access Token\' is missing. https://www.figma.com/developers/docs#authentication');
    }

    return Figma.Client({ personalAccessToken: token });
};

const fileImages = async (client: Figma.ClientInterface, fileId: string, ids: string[]): Promise<{readonly [key: string]: string}> => {
    const response = await client.fileImages(fileId, {
        ids,
        format: 'svg',
        svg_include_id: true,
    }).catch(() => {
        return client.fileImages(fileId, {
            ids,
            format: 'svg',
            svg_include_id: true,
        }).catch((error: Error) => {
            throw new Error(`while fetching fileImages: ${error.message}`);
        });
    });

    return response.data.images;
};

const getImages = async (client: Figma.ClientInterface, fileId: string, ids: string[]): Promise<{readonly [key: string]: string}> => {
    const idss = chunk(ids, 100);
    const limit = pLimit(5);

    const resolves = await Promise.all(idss.map((groupIds) => {
        return limit(() => fileImages(client, fileId, groupIds));
    }));

    return Object.assign({}, ...resolves);
};

type FigmaExportFileSvg = {
    [key: string]: string;
}

type FileSvgOptions = {
    transformers?: FigmaExport.StringTransformer[]
    concurrency?: number
    retries?: number
    onFetchCompleted?: (data: { index: number, total: number }) => void
}

const fileSvgs = async (
    client: Figma.ClientInterface,
    fileId: string,
    ids: string[],
    {
        concurrency = 5,
        retries = 3,
        transformers = [],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onFetchCompleted = () => {},
    }: FileSvgOptions = {},
): Promise<FigmaExportFileSvg> => {
    const images = await getImages(client, fileId, ids);
    const limit = pLimit(concurrency);
    let index = 0;
    const svgPromises = Object.entries(images).map(async ([id, url]) => {
        const svg = await limit(
            () => pRetry(() => fetchAsSvgXml(url), { retries }),
        );
        const svgTransformed = await promiseSequentially(transformers, svg);

        onFetchCompleted({
            index: index += 1,
            total: ids.length,
        });

        return [id, svgTransformed];
    });

    const svgs = await Promise.all(svgPromises);

    return fromEntries(svgs);
};

// todo: probably nothing todo --> check
const enrichPagesWithSvg = async (
    client: Figma.ClientInterface,
    fileId: string,
    pages: FigmaExport.PageNode[],
    svgOptions?: FileSvgOptions,
): Promise<FigmaExport.PageNode[]> => {
    const componentIds = getIdsFromPages(pages);

    if (componentIds.length === 0) {
        throw new Error('No components found');
    }

    const svgs = await fileSvgs(client, fileId, componentIds, svgOptions);

    return pages.map((page) => ({
        ...page,
        components: page.components.map((component) => ({
            ...component,
            svg: svgs[component.id] || emptySvg,
        })),
    }));
};

export {
    getComponents,
    getPages,
    getIdsFromPages,
    getClient,
    getImages,
    fileSvgs,
    enrichPagesWithSvg,
};
