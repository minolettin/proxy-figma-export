import * as FigmaExport from '@minolettinat/proxy-figma-export-types';

const parse = (node: FigmaExport.StyleNode): FigmaExport.StyleTypeGrid | undefined => {
    if (node.styleType === 'GRID' && node.type === 'FRAME') {
        return {
            styleType: 'GRID',
        };
    }

    return undefined;
};

export {
    parse,
};
