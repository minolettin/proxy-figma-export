import * as FigmaExport from '@minolettinat/proxy-figma-export-types';
import { kebabCase } from '@minolettinat/proxy-figma-export-utils';

import { writeVariable } from './utils';
import { Extension } from './types';

import fs = require('fs');
import path = require('path');

type Options = {
    output: string;
    getExtension?: () => Extension;
    getFilename?: () => string;
    getVariableName?: (style: FigmaExport.Style) => string;
}

export = ({
    output,
    getExtension = () => 'SCSS',
    getFilename = () => '_variables',
    getVariableName = (style) => kebabCase(style.name).toLowerCase(),
}: Options): FigmaExport.StyleOutputter => {
    return async (styles) => {
        const extension = getExtension();

        let text = '';

        styles.forEach((style) => {
            if (style.visible) {
                const variableName = getVariableName(style);

                // eslint-disable-next-line default-case
                switch (style.styleType) {
                    case 'FILL': {
                        const value = style.fills
                            .filter((fill) => fill.visible)
                            .map((fill) => fill.value)
                            .join(', ');

                        text += writeVariable(style.comment, variableName, value, extension);

                        break;
                    }

                    case 'EFFECT': {
                        const visibleEffects = style.effects.filter((effect) => effect.visible);

                        const boxShadowValue = visibleEffects
                            .filter((effect) => effect.type === 'INNER_SHADOW' || effect.type === 'DROP_SHADOW')
                            .map((effect) => effect.value)
                            .join(', ');

                        const filterBlurValue = visibleEffects
                            .filter((effect) => effect.type === 'LAYER_BLUR')
                            .map((effect) => effect.value)
                            .join(', ');

                        // Shadow and Blur effects cannot be combined together since they use two different CSS properties.
                        text += writeVariable(style.comment, variableName, boxShadowValue || filterBlurValue, extension);

                        break;
                    }

                    case 'TEXT': {
                        const value = `(
                            "font-family": "${style.style.fontFamily}",
                            "font-size": ${style.style.fontSize}px,
                            "font-style": ${style.style.fontStyle},
                            "font-variant": ${style.style.fontVariant},
                            "font-weight": ${style.style.fontWeight},
                            "letter-spacing": ${style.style.letterSpacing}px,
                            "line-height": ${style.style.lineHeight}px,
                            "text-align": ${style.style.textAlign},
                            "text-decoration": ${style.style.textDecoration},
                            "text-transform": ${style.style.textTransform},
                            "vertical-align": ${style.style.verticalAlign}
                        )`;

                        text += writeVariable(style.comment, variableName, value, extension);

                        break;
                    }
                }
            }
        });

        const filePath = path.resolve(output);

        fs.mkdirSync(filePath, { recursive: true });
        fs.writeFileSync(path.resolve(filePath, `${getFilename()}.${extension.toLowerCase()}`), text);
    };
};
