# auto-format

[![Build Status](https://travis-ci.org/jundl77/auto-format.svg?branch=master)](https://travis-ci.org/jundl77/auto-format)
[![npm](http://img.shields.io/npm/v/auto-format.svg?style=flat)](https://www.npmjs.com/package/auto-format)
[![Document](https://doc.esdoc.org/github.com/jundl77/auto-format/badge.svg)](https://doc.esdoc.org/github.com/jundl77/auto-format/)

An easy to use and light-weight library to auto-format code in javascript. Works well with code highlighting libraries to display beautiful, uniformly formatted code. 

As of right now, only Java can be formatted. However the library is very extensible, in fact you only have to write 3 methods, so it is easy to add support for more languages.
Please see [contribute](#contribute) if you would like to contribute. Help is always appreciated!

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
Format a string of code. The string will be cut into lines and lines will 
be indented accordingly to their scope.

#####-- Parameters:
`indentToken` : The token used to indent lines (e.g. 2 or 4 spaces).

`unformattedCode` : A string of unformatted code (including line breaks).

#####-- Return:
`formattedCode` : A string of formatted code. All lines will have been correctly
                  indented according to their scope.
                  
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
