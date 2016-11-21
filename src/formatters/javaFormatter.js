import Formatter from "../core/formatter"

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

/**
 * The JavaFormatter is auto-formatter implementation for java.
 */
export default class JavaFormatter extends Formatter {
    /**
     * Create a new JavaFormatter
     *
     * @param formatUnit The token to be used for line indentations.
     */
    constructor(formatUnit) {
        super(formatUnit)
        this.methodSigRegex = new RegExp("^(public |private |protected |static |final |native |synchronized " +
            "|abstract |transient )*(<.*>\\s+)?\\w+(<.*>|\\[.*\\])?\\s+\\w+\\s*\\(.*$")
    }

    /**
     * Format a string of code. The string will be cut into lines and lines
     * will be indented accordingly to their scope.
     *
     * @param codeString The string of code to format.
     * @returns {*} An array of formatted lines.
     */
    format(codeString) {
        return this.formatSnippet(codeString, null, null, null)
    }

    /**
     * A slight variation of format(codeString). Useful if you want to display
     * a code snippet around a selection of lines.
     *
     * In addition to indenting lines, formatSnippet takes a selection as a
     * start and end row in a large slab of code and cuts out a snippet of
     * code around this selection. The start and end of the snippet is based
     * on an offset that is provided as a parameter. The offset with the start
     * and end of the selection create a sort of range from which the snippet
     * is taken.
     *
     * EXAMPLE:
     * Selection start row: 11 ---- Selection end row: 11 ---- Offset: 5
     * \----> Snippet range: [11 - 5, 11 + 5] = [6, 16]
     *
     * START:
     *
     * 1.  @Test
     * 2.  public void test1() {
     * 3.      System.out.println("Test 1");
     * 4.  }
     * 5.
     * 6.  // ------------------
     * 7.  // Perform test 2.
     * 8.  // ------------------
     * 9. @Test
     * 10. public void test2() {
     * 11.     System.out.println("Test 1");
     * 12. }
     * 13.
     * 14. public void test3() {
     * 15. ...
     *
     * RESULT:
     *
     * 6.  // ------------------
     * 7.  // Perform test 2.
     * 8.  // ------------------
     * 9. @Test
     * 10. public void test2() {
     * 11.     System.out.println("Test 1");
     * 12. }
     *
     * The selection is identified to belong to test2() and thus only test2()
     * is returned. If the method is longer than the offset, than only the
     * part within the offset will be returned. No code is added to the range
     * with the exception of comment lines above the selection, to close
     * unfinished comments.
     *
     * @param code The original code base in which the selection is.
     * @param startRow The start row of the selection in the code base.
     * @param endRow The end row of the selection in the code base.
     * @param offset The offset the defines the range on which to base the
     *               snippet.
     * @returns {*} An array of formatted lines that form the snippet, as well
     *              as the start and end lines of the snippet in the original
     *              code base.
     */
    formatSnippet(code, startRow, endRow, offset) {
        return super.formatSnippet(code, startRow, endRow, offset,
            ((codeArray, index) => this._expressionIdentifier(codeArray, index)),
            ((lines, index) => this._scopeEnterFunc(lines, index)),
            ((lines, index) => this._scopeExitFunc(lines, index)),
            (line => this._checkForFunction(line)),
            (line => this._checkForSpecialStatement(line)),
            COMMENT_BODY_TOKEN, COMMENT_SIMPLE_TOKEN)
    }

    /**
     * Checks if a line identified by an index in an array qualifies
     * as an expression.
     *
     * An expression is defined as:
     * - A line that ends with a termination token (e.g. ';')
     * - A line that defines a scope start (e.g. '{')
     * - A line that defines a scope end (e.g. '}')
     * - A line that starts with a special character (e.g. '@')
     * - A line that starts with a comment (e.g. '//')
     * - An empty line (e.g. '')
     *
     * @param codeArray An array of lines of code.
     * @param index The index of the relevant line in the code array.
     * @returns {*} True if the line qualifies as an expression, else false.
     * @private
     */
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

    /**
     * Checks if a line identified by an index in an array starts a new scope.
     * Example: 'if (foo) {'
     *
     * @param codeArray An array of lines of code.
     * @param index The index of the relevant line in the code array.
     * @returns {*} The position in the line where the new scope starts or null
     *              if this line does not start a new scope.
     * @private
     */
    _scopeEnterFunc(codeArray, index) {
        return this._identifyScope(codeArray, index, SCOPE_ENTER_TOKEN)
    }

    /**
     * Checks if a line identified by an index in an array ends an existing scope.
     * Example: '}'
     *
     * @param codeArray An array of lines of code.
     * @param index The index of the relevant line in the code array.
     * @returns {*} The position in the line where the scope ends or null
     *              if this line does not end a scope.
     * @private
     */
    _scopeExitFunc(codeArray, index) {
        return this._identifyScope(codeArray, index,SCOPE_EXIT_TOKEN)
    }

    /**
     * Helper method for _scopeEnterFunc and _scopeExitFunc.
     *
     * @param codeArray An array of lines of code.
     * @param index The index of the relevant line in the code array.
     * @param token The token to find in the line.
     * @returns {*} The position in the line where the scope starts or ends or
     *              null if this line does neither.
     * @private
     */
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

    /**
     * Checks if a line contains a special statement.
     *
     * A special statement is defined in Java by:
     * - An empty line (e.g. '')
     * - A line that starts with an annotation (e.g. '@')
     * - A line that starts with a comment (e.g. '//')
     *
     * @param line The line to check for a special statement.
     * @returns {boolean|*} True if the line contains a special statement, else false.
     * @private
     */
    _checkForSpecialStatement(line) {
        return line.startsWith(ANNOTATION_TOKEN)
            || line === ''
            || COMMENT_TOKENS.reduce((result, token) => result || line.startsWith(token), false)
    }

    /**
     * Checks if a line is a method signature.
     *
     * @param line The line to check for.
     * @returns {boolean} True if the line is a method signature, else false.
     * @private
     */
    _checkForFunction(line) {
        if (PROTECTED_NON_METHOD_TOKENS.reduce((result, token) => result || line.trim().startsWith(token), false)) {
            return false
        }

        return this.methodSigRegex.test(line)
    }
}
