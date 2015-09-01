:::sidecode
### Installation
```bash
npm install meta-doc -g
```
:::

## Getting started

META Doc can be installed via NPM.

:::clear :::

:::sidecode-h3
### Initialize new project in current directory
```bash
meta-doc -i
```
:::

### Create new documentation

META Doc comes with project skeleton which creates all necessary directories and files for you with sample contents included.

:::clear :::

:::sidecode-h3
### Start local server and watch for changes
```bash
meta-doc -w -s
```
:::

### Start local server

META Doc has webserver built-in. Command line flag `-s` will start local webserver.

Also if you provide `-w` flag then META Doc will be watching for changes in your documentation pages and will recompile changed contents automatically.

You can then access your new documentation by opening [http://127.0.0.1:8080/](http://127.0.0.1:8080/).



::: success
**Auto refresh** {.title}

META Doc also provides auto-refresh mechanism so when you change contents of your documentation then webpage in your browser will refresh automatically.

**NOTE**: This works properly only if you also provide `-w` flag.
:::

:::clear :::

:::sidecode-h3
### Just compile
```bash
meta-doc
```
:::

### Compile once

To compile your documentation and exit you don't need to provide any flags.

For more information look at [Usage](../usage/) or run `meta-doc -h`.