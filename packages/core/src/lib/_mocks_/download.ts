import axios, { AxiosRequestConfig } from 'axios';
import * as Figma from '@minolettinat/proxy-figma-js';
import { writeFileSync } from 'fs';
import { sep } from 'path';
import createHttpsProxyAgent from 'https-proxy-agent';

(async () => {
    const { FIGMA_TOKEN } = process.env;

    if (!FIGMA_TOKEN) {
        throw new Error('FIGMA_TOKEN is not defined');
    }

    const config: AxiosRequestConfig = {
        headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN },
    };

    if (process.env.https_proxy) {
        config.httpsAgent = createHttpsProxyAgent(process.env.https_proxy);
    }

    const fetch = async (url: string) => (await axios.get(url, config)).data;

    const figmaFiles: Figma.FileResponse = await fetch(
        'https://api.figma.com/v1/files/fzYhvQpqwhZDUImRz431Qo',
    );

    const nodes = Object.keys(figmaFiles.styles);

    const figmaFileNodes: Figma.FileNodesResponse = await fetch(
        `https://api.figma.com/v1/files/fzYhvQpqwhZDUImRz431Qo/nodes?ids=${nodes.join(',')}`,
    );

    writeFileSync(`${__dirname}${sep}figma.files.json`, JSON.stringify(figmaFiles, undefined, 4));
    writeFileSync(`${__dirname}${sep}figma.fileNodes.json`, JSON.stringify(figmaFileNodes, undefined, 4));
})();
