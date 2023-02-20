/**
 * If you want to try this configuration you can just run:
 *   $ npm install --save-dev typescript ts-node @types/node @minolettinat/proxy-figma-export-types
 *   $ npm install --save-dev @minolettinat/proxy-figma-export-transform-svg-with-svgo @minolettinat/proxy-figma-export-output-components-as-svgr
 *   $ npm install --save-dev @svgr/plugin-svgo @svgr/plugin-jsx @svgr/plugin-prettier
 * */

import { FigmaExportRC, ComponentsCommandOptions } from "@minolettinat/proxy-figma-export-types";

import transformSvgWithSvgo from "@minolettinat/proxy-figma-export-transform-svg-with-svgo";
import transformSvgWithSvgr from "@minolettinat/proxy-figma-export-output-components-as-svgr";

const componentOptions: ComponentsCommandOptions = {
  fileId: "fzYhvQpqwhZDUImRz431Qo",
  // version: 'xxx123456', // optional - file's version history is only supported on paid Figma plans
  onlyFromPages: ["icons"],
  transformers: [
    transformSvgWithSvgo({
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
        {
          name: "removeXMLNS",
          active: true,
        },
      ],
    }),
  ],
  outputters: [
    transformSvgWithSvgr({
      output: "./output",
      getFileExtension: () => ".tsx",
      getSvgrConfig: () => ({
        expandProps: "end",
        icon: true,
        native: true,
        plugins: [
          "@svgr/plugin-svgo",
          "@svgr/plugin-jsx",
          "@svgr/plugin-prettier",
        ],
        template: ({ componentName, props, jsx, exports }, { tpl }) => tpl`
                    const ${componentName} = (${props}) => (${jsx});
                    ${exports}
                `,
        typescript: true,
      }),
    }),
  ],
};

(module.exports as FigmaExportRC) = {
  commands: [["components", componentOptions]],
};
