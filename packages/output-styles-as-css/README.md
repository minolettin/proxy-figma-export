# @minolettinat/proxy-figma-export-output-styles-as-css

> Styles Outputter for [@minolettinat/figma-export](https://github.com/marcomontalbano/figma-export) that exports styles to CSS.

With this outputter you can export all the styles as variables inside a `.css` file.

This is a sample of the output:

```sh
$ tree output/
# output/
# └── _variables.css
```


## .figmaexportrc.js

You can easily add this outputter to your `.figmaexportrc.js`:

```js
module.exports = {
    commands: [
        ['styles', {
            fileId: 'fzYhvQpqwhZDUImRz431Qo',
            outputters: [
                require('@minolettinat/proxy-figma-export-output-styles-as-css')({
                    output: './output'
                })
            ]
        }],
    ]
}
```

`output` is **mandatory**.

`getFilename` and `getVariableName` are **optional**.

```js
const { kebabCase } = require('@minolettinat/proxy-figma-export-utils');

...

require('@minolettinat/proxy-figma-export-output-styles-as-css')({
    output: './output',
    getFilename: () => '_variables',
    getVariableName: (style) => kebabCase(style.name).toLowerCase(),
})
```

> *defaults may change, please refer to `./src/index.ts`*

## Install

Using npm:

```sh
npm install --save-dev @minolettinat/proxy-figma-export-output-styles-as-css
```

or using yarn:

```sh
yarn add @minolettinat/proxy-figma-export-output-styles-as-css --dev
```
