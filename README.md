# auto-format

[![Build Status](https://travis-ci.org/jundl77/auto-format.svg?branch=master)](https://travis-ci.org/jundl77/auto-format)
[![npm](http://img.shields.io/npm/v/auto-format.svg?style=flat)](https://www.npmjs.com/package/auto-format)
[![Document](https://doc.esdoc.org/github.com/jundl77/auto-format/badge.svg)](https://doc.esdoc.org/github.com/jundl77/auto-format/)

An easy to use, light-weight library to auto-format code in javascript. Works well with code highlighting libraries to display beautiful, uniformly formatted code. 

As of right now only Java can be formatted properly, although you will probably get decent results with any language that uses '{' and '}' to mark scopes. Further more the library is very extensible, in fact you only have to implement 5 methods to add support for more languages.
Please see [contribute](#contribute) if you would like to contribute. Help is always welcome!

## Examples

Detailed examples comming soon! For now check out https://exemplator.xyz where all code is being formatted 
with this library.

Live example for [*format*](https://runkit.com/jundl77/auto-format.format)

## Install

Run ` npm install auto-format --save`

## Usage

As of right now, only fully Java is supported.

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

##### -- Parameters:
`indentToken` : The token used to indent lines (e.g. 2 or 4 spaces).

`unformattedCode` : A string of unformatted code (including line breaks).

##### -- Return:
`formattedCode` : An array lines of code. All lines will have been correctly
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

##### -- Parameters:
`indentToken` : The token used to indent lines (e.g. 2 or 4 spaces).

`unformattedCode` : A string of unformatted code (including line breaks).

`selectionStartRow` :

`selectionEndRow` :

`snippetOffset` :

##### -- Return:
`formattedCode` :

## Contribute
