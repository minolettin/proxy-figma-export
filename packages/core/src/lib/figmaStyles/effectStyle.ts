import * as Figma from '@minolettinat/proxy-figma-js';
import * as FigmaExport from '@figma-export/types';

import { notEmpty } from '../utils';
import { extractColor } from './paintStyle';

const createEffectStyle = (effect: Figma.Effect): FigmaExport.EffectStyle | undefined => {
    // eslint-disable-next-line default-case
    switch (effect.type) {
        case 'INNER_SHADOW':
        case 'DROP_SHADOW': {
            const color = extractColor(effect);
            const spreadRadius = 0;
            const inset = effect.type === 'INNER_SHADOW';

            if (color && effect.offset) {
                return {
                    type: effect.type,
                    visible: effect.visible,
                    color,
                    inset,
                    offset: effect.offset,
                    blurRadius: effect.radius,
                    spreadRadius,

                    // eslint-disable-next-line max-len
                    value: `${inset ? 'inset ' : ''}${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${spreadRadius}px ${color.rgba}`,
                };
            }

            break;
        }

        case 'LAYER_BLUR': {
            return {
                type: effect.type,
                visible: effect.visible,
                blurRadius: effect.radius,
                value: `blur(${effect.radius}px)`,
            };
        }
    }

    return undefined;
};

const parse = (node: FigmaExport.StyleNode): FigmaExport.StyleTypeEffect | undefined => {
    if (node.styleType === 'EFFECT' && node.type === 'RECTANGLE') {
        return {
            styleType: 'EFFECT',
            effects: Array.from(node.effects)
                .reverse()
                .map(createEffectStyle)
                .filter(notEmpty),
        };
    }

    return undefined;
};

export {
    parse,
};
