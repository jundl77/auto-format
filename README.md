# auto-format

[![Build Status](https://travis-ci.org/jundl77/auto-format.svg?branch=master)](https://travis-ci.org/jundl77/auto-format)
[![npm](http://img.shields.io/npm/v/auto-format.svg?style=flat)](https://www.npmjs.com/package/auto-format)
[![Document](https://doc.esdoc.org/github.com/jundl77/auto-format/badge.svg)](https://doc.esdoc.org/github.com/jundl77/auto-format/)

## Examples

## Install

Run ` npm install auto-format --save`

## Usage

As of right now, only Java is supported.

ES6: 
```es6 
import Formatter from "auto-format"
```
Vanilla JS: 

```js 
var Formatter = require('auto-format');
```
***

#### Simple example: *format*

```js
var indentToken = "   ";
var javaFormatter = Formatter.createJavaFormatter(indentToken);
var formattedCode = javaFormatter.format(unformattedCode);
```

#####-- Parameters:
`indentToken` :

`unformattedCode` :

#####-- Return:
`formattedCode` :

***

#### Complex example: *formatSnippet*

```js
var indentToken = "   ";
var javaFormatter = Formatter.createJavaFormatter(indentToken);

var selectionStartRow = 11;
var selectionEndRow = 11;
var snippetOffset = 5;
var formattedCode = javaFormatter.formatSnippet(unformattedCode, selectionStartRow, 
    selectionEndRow, snippetOffset);
```

#####-- Parameters:
`indentToken` :

`unformattedCode` :

`selectionStartRow` :

`selectionEndRow` :

`snippetOffset` :

#####-- Return:
`formattedCode` :

## Contribute
