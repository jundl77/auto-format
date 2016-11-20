import Formatter from "./formatter"

var SCOPE_ENTER_TOKEN = '{'
var SCOPE_EXIT_TOKEN = '}'
var EXPRESSION_TERMINATION_TOKEN = ';'
var ANNOTATION_TOKEN = '@'
var COMMENT_START_TOKEN = '/**'
var COMMENT_START_TOKEN_2 = '/*'
var COMMENT_BODY_TOKEN = '*'
var COMMENT_END_TOKEN = '*/'
var COMMENT_SIMPLE_TOKEN = '//'
var COMMENT_TOKENS = [COMMENT_START_TOKEN, COMMENT_START_TOKEN_2, COMMENT_BODY_TOKEN, COMMENT_END_TOKEN, COMMENT_SIMPLE_TOKEN]
var PROTECTED_NON_METHOD_TOKENS = ['return', 'new']

export default class JavaFormatter extends Formatter {

    constructor(formatUnit) {
        super(formatUnit)
        this.methodSigRegex = new RegExp("^(public |private |protected |static |final |native |synchronized " +
            "|abstract |transient )*(<.*>\\s+)?\\w+(<.*>|\\[.*\\])?\\s+\\w+\\s*\\(.*$")
    }

    format(codeString) {
        return this.formatSnippet(codeString, null, null, null)
    }

    formatSnippet(code, startRow, endRow, offset) {
        return super.formatSnippet(code, startRow, endRow, offset,
            ((codeArray, index) => this._expressionIdentifier(codeArray, index)),
            ((lines, index) => this._scopeEnterFunc(lines, index)),
            ((lines, index) => this._scopeExitFunc(lines, index)),
            (line => this._checkForFunction(line)),
            (line => this._checkForSpecialStatement(line)),
            COMMENT_BODY_TOKEN, COMMENT_SIMPLE_TOKEN)
    }

    _expressionIdentifier(codeArray, index) {
        if (codeArray.length > index) {
            let line = codeArray[index].replace('\n', '').trim()
            return line.endsWith(EXPRESSION_TERMINATION_TOKEN)
                || this._scopeEnterFunc([line], 0) !== null
                || this._scopeExitFunc([line], 0) !== null
                || this._checkForSpecialStatement(line)
        }

        return false
    }

    _scopeEnterFunc(codeArray, index) {
        return this._identifyScope(codeArray, index, SCOPE_ENTER_TOKEN)
    }

    _scopeExitFunc(codeArray, index) {
        return this._identifyScope(codeArray, index,SCOPE_EXIT_TOKEN)
    }

    _identifyScope(codeArray, index, token) {
        if (codeArray.length > 0) {
            let scopeIndex = codeArray[index].indexOf(token)
            if (scopeIndex !== -1) {
                return scopeIndex
            }
            return null
        } else {
            return null
        }
    }

    _checkForSpecialStatement(line) {
        return line.startsWith(ANNOTATION_TOKEN)
            || line === ''
            || COMMENT_TOKENS.reduce((result, token) => result || line.startsWith(token), false)
    }

    _checkForFunction(line) {
        if (PROTECTED_NON_METHOD_TOKENS.reduce((result, token) => result || line.trim().startsWith(token), false)) {
            return false
        }

        return this.methodSigRegex.test(line)
    }
}
