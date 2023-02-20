import { optimize, OptimizeOptions } from 'svgo';

import * as FigmaExport from '@minolettinat/proxy-figma-export-types';

export = (options: OptimizeOptions): FigmaExport.StringTransformer => {
    return async (svg) => {
        const result = optimize(svg, options);

        if (!('data' in result)) {
            return undefined;
        }

        return result.data;
    };
};
