/**
 * If you want to try this configuration you can just run:
 *   $ npm install --save-dev typescript ts-node @types/node @minolettinat/proxy-figma-export-types
 *   $ npm install --save-dev @minolettinat/proxy-figma-export-output-styles-as-sass @minolettinat/proxy-figma-export-transform-svg-with-svgo @minolettinat/proxy-figma-export-output-components-as-svg @minolettinat/proxy-figma-export-output-components-as-es6
 */

import { FigmaExportRC, StylesCommandOptions, ComponentsCommandOptions } from '@minolettinat/proxy-figma-export-types';

import outputStylesAsSass from '@minolettinat/proxy-figma-export-output-styles-as-sass';
import transformSvgWithSvgo from '@minolettinat/proxy-figma-export-transform-svg-with-svgo';
import outputComponentsAsSvg from '@minolettinat/proxy-figma-export-output-components-as-svg';
import outputComponentsAsEs6 from '@minolettinat/proxy-figma-export-output-components-as-es6';

const styleOptions: StylesCommandOptions = {
    fileId: 'fzYhvQpqwhZDUImRz431Qo',
    // version: 'xxx123456', // optional - file's version history is only supported on paid Figma plans
    // onlyFromPages: ['icons'], // optional - Figma page names (all pages when not specified)
    outputters: [
        outputStylesAsSass({
            output: './output'
        })
    ]
};

const componentOptions: ComponentsCommandOptions = {
    fileId: 'fzYhvQpqwhZDUImRz431Qo',
    // version: 'xxx123456', // optional - file's version history is only supported on paid Figma plans
    onlyFromPages: ['icons'],
    transformers: [
        transformSvgWithSvgo({
            plugins: [
                {
                    name: 'preset-default',
                    params: {
                        overrides: {
                            removeViewBox: false,
                        }
                    }
                },
                {
                    name: 'removeDimensions',
                    active: true
                }
            ]
        })
    ],
    outputters: [
        outputComponentsAsSvg({
            output: './output'
        }),
        outputComponentsAsEs6({
            output: './output'
        })
    ]
};

(module.exports as FigmaExportRC) = {
    commands: [
        ['styles', styleOptions],
        ['components', componentOptions]
    ]
};
