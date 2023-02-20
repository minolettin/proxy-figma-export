# @minolettinat/proxy-figma-export-output-components-as-svgr

> Outputter for [@minolettinat/figma-export](https://github.com/marcomontalbano/figma-export) that exports components as React components.

With this outputter you can export all Figma components as React components into the specified output folder.

This is a sample of the output from this [Figma file](https://www.figma.com/file/fzYhvQpqwhZDUImRz431Qo):

```sh
$ tree output/

# output
# ├── icons
# │   ├── FigmaArrow.jsx
# │   ├── FigmaExport.jsx
# │   ├── FigmaLogo.jsx
# │   └── index.js
# └── unit-test
#     ├── figma
#     │   ├── logo
#     │   │   ├── Main.jsx
#     │   │   ├── MainBright.jsx
#     │   │   └── index.js
#     │   ├── Logo.jsx
#     │   └── index.js
#     ├── FigmaDefaultLogo.jsx
#     └── index.js
```

> **Tip**: A figma component named `icon/eye` will be exported as `Eye.jsx` inside the `icon` folder. Another `index.js` file will be created inside the `icon` folder and this will export directly the `Eye` component.

## .figmaexportrc.js

You can easily add this outputter to your `.figmaexportrc.js`:

```js
module.exports = {
    commands: [
        ['components', {
            fileId: 'fzYhvQpqwhZDUImRz431Qo',
            onlyFromPages: ['icons', 'unit-test'],
            outputters: [
                require('@minolettinat/proxy-figma-export-output-components-as-svgr')({
                    output: './output'
                })
            ]
        }],
    ]
}
```

`output` is **mandatory**.

`getDirname`, `getComponentName`, `getComponentFilename`, `getFileExtension`, `getExportTemplate` and `getSvgrConfig` are **optional**.

```js
const path = require('path');
const { pascalCase } = require('@minolettinat/proxy-figma-export-utils');

...

require('@minolettinat/proxy-figma-export-output-components-as-svgr')({
    output: './output',
    getDirname: (options) => `${options.pageName}${path.sep}${options.dirname}`,
    getComponentName: (options) => `${pascalCase(options.basename)}`,
    getComponentFilename = (options): string => `${getComponentName(options)}`,
    getFileExtension: (options) => '.jsx',
    getSvgrConfig: (options) => ({}),
    getExportTemplate = (options): string => {
        const reactComponentName = getComponentName(options);
        const reactComponentFilename = `${getComponentFilename(options)}${getFileExtension(options)}`;
        return `export { default as ${reactComponentName} } from './${reactComponentFilename}';`;
    },
})
```

> *defaults may change, please refer to `./src/index.ts`*

`getComponentFilename` if not set, it will use the same value for `getComponentName`.

`getSvgrConfig` is a function that returns the [SVGR configuration](https://react-svgr.com/docs/options/) object.

## Install

Using npm:

```sh
npm install --save-dev @minolettinat/proxy-figma-export-output-components-as-svgr
```

or using yarn:

```sh
yarn add @minolettinat/proxy-figma-export-output-components-as-svgr --dev
```
