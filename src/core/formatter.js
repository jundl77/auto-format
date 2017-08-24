import ScopeNode from "./scopeTree";

/**
 * This is the core formatter. It contains most of the logic behind the formatting,
 * and it is written in such a way that it is easily extendable to other programming
 * languages. To create a formatter for a new programming language, extend this class
 * and follow the JavaFormatter as an example.
 */
export default class AFormatter {

  /**
   * Create a new AFormatter (abstract formatter).
   *
   * @constructor
   * @param formatUnit The token to be used for line indentations.
   */
  constructor(formatUnit) {
    /**
     * @private
     */
    this.formatUnit = formatUnit

    /**
     * @private
     */
    this.fullCodeArray = ''

    /**
     * @private
     */
    this.startSelection = 0

    /**
     * @private
     */
    this.endSelection = 0

    /**
     * @private
     */
    this.snippetOffset = 0

    /**
     * @private
     */
    this.bodyCommentToken = ''

    /**
     * @private
     */
    this.simpleCommentToken = ''

    /**
     * @private
     */
    this.expressionIdentifier = null

    /**
     * @private
     */
    this.scopeEnterFunc = null

    /**
     * @private
     */
    this.scopeExitFunc = null

    /**
     * @private
     */
    this.identifyMethodSigFunc = null

    /**
     * @private
     */
    this.identifySpecialStatement = null
  }

  /**
   * Format a string of code. The string will be cut into lines and lines
   * will be indented accordingly to their scope.
   *
   * As a reference, look at the format function in the JavaFormatter.
   *
   * @param code String of code to format.
   * @param expressionIdentifier Function that identifies if a line qualifies as an expression:
   * - A line that ends with a termination token (e.g. ';')
   * - A line that defines a scope start (e.g. '\{')
   * - A line that defines a scope end (e.g. '\}')
   * - A line that starts with a special character (e.g. '@')
   * - A line that starts with a comment (e.g. '//')
   * - An empty line (e.g. '')
   * @param scopeEnterFunc Function that identifies if a new scope is entered in a line.
   * @param scopeExitFunc Function that identifies if a scope is exited in a line.
   * @param formatCommentsFunc Function that formats comments (e.g. add space before body and
   *                                 end comment in Javadoc)
   * @returns {Array} An array of formatted lines.
   */
  format(code, expressionIdentifier, scopeEnterFunc, scopeExitFunc, formatCommentsFunc) {
    return this.formatSnippet(code, null, null, null, expressionIdentifier, scopeEnterFunc,
      scopeExitFunc, formatCommentsFunc, null, null, null, null)
  }

  /**
   * A slight variation of format(codeString). Useful if you want to display
   * a code snippet around a selection of lines.
   *
   * As a reference, look at the formatSnippet function in the JavaFormatter.
   *
   * In addition to indenting lines, formatSnippet takes a selection as a
   * start and end row in a large slab of code and cuts out a snippet of
   * code around this selection. The start and end of the snippet is based
   * on an offset that is provided as a parameter. The offset with the start
   * and end of the selection create a sort of range from which the snippet
   * is taken.
   *
   * In the example below, the selection is identified to belong to test2()
   * and thus only test2() is returned. If the method is longer than the
   * offset, than only the part within the offset will be returned. No code
   * is added to the range with the exception of comment lines above the
   * selection, to close unfinished comments.
   *
   * @example
   * <caption>Selection start row: 11 ---- Selection end row: 11 ---- Offset: 6 ----> Snippet range: [11 - 6, 11 + 6] = [5, 17]</caption>
   *
   * START:
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
   * 11.     System.out.println("Test 2");
   * 12. }
   * 13.
   * 14. @Test
   * 15. public void test3() {
   * 16.     System.out.println("Test 3");
   * 17. }
   * 18. ...
   *
   * RESULT:
   * 6.  // ------------------
   * 7.  // Perform test 2.
   * 8.  // ------------------
   * 9. @Test
   * 10. public void test2() {
   * 11.     System.out.println("Test 1");
   * 12. }
   *
   * @param code The original code base in which the selection is.
   * @param startRow The start row of the selection in the code base.
   * @param endRow The end row of the selection in the code base.
   * @param offset The offset the defines the range on which to base the
   *               snippet.
   * @param expressionIdentifier Function that identifies if a line qualifies as an expression:
   * An expression is defined as:
   * - A line that ends with a termination token (e.g. ';')
   * - A line that defines a scope start (e.g. '\{')
   * - A line that defines a scope end (e.g. '\}')
   * - A line that starts with a special character (e.g. '@')
   * - A line that starts with a comment (e.g. '//')
   * - An empty line (e.g. '')
   * @param scopeEnterFunc Function that identifies if a new scope is entered in a line.
   * @param scopeExitFunc Function that identifies if a scope is exited in a line.
   * @param formatCommentsFunc Function that formats comments (e.g. add space before body and
   *                                 end comment in Javadoc)
   * @param identifyMethodSigFunc Function that identifies if a line is a method signature.
   * @param identifySpecialStatement Function that identifies if a line contains a special
   *                                 statement (e.g. comment or '@' in Java)
   * @param bodyCommentToken The token for 'body comments' (e.g. '*' in Java)
   * @param simpleCommentToken Simple comment token (e.g. '//')
   * @returns {Array} An array of formatted lines that form the snippet, separated
   *              into prefix selection and suffix, as well as the start and
   *              end lines of the snippet in the original code base.
   */
  formatSnippet(code, startRow, endRow, offset, expressionIdentifier, scopeEnterFunc,
                scopeExitFunc, formatCommentsFunc, identifyMethodSigFunc, identifySpecialStatement,
                bodyCommentToken, simpleCommentToken) {
    // Initialize
    this.fullCodeArray = code.split('\n')
    this.startSelection = startRow
    this.endSelection = endRow
    this.snippetOffset = offset
    this.expressionIdentifier = expressionIdentifier
    this.scopeEnterFunc = scopeEnterFunc
    this.scopeExitFunc = scopeExitFunc
    this.formatCommentFunc = formatCommentsFunc
    this.identifyMethodSigFunc = identifyMethodSigFunc
    this.identifySpecialStatement = identifySpecialStatement
    this.bodyCommentToken = bodyCommentToken
    this.simpleCommentToken = simpleCommentToken

    let codeArray = this.fullCodeArray

    // In case we have a snippet, find the snippet
    let snippetPresent = this.startSelection !== null && this.endSelection !== null
      && offset !== null && this.startSelection !== -1 && this.endSelection !== -1
      && offset !== -1

    let snippet = []
    if (snippetPresent) {
      snippet = [this.fullCodeArray.slice(this.startSelection - 1, this.endSelection),
        this.fullCodeArray.slice(this.startSelection - offset - 1,
          this.endSelection + offset)]
      codeArray = this._preFormatSnippet(snippet[1], snippet[0])
    }

    // Build and balance the scope tree
    codeArray = codeArray.map(line => line.trim())
    let scopeTree = new ScopeNode(null, null)

    // copy array because it is consumed
    scopeTree.build(codeArray.slice(), 0, this.scopeEnterFunc, this.scopeExitFunc)
    scopeTree.balance()

    // Init formatted array
    let formattedArray = []
    for (let i = 0; i < codeArray.length; i++) {
      formattedArray[i] = ""
    }
    this._preFormatArray(formattedArray, scopeTree)

    // Fill formatted array with code
    for (let i = 0; i < codeArray.length; i++) {
      formattedArray[i] += codeArray[i]
    }

    // Add spaces after lines that do not qualify as an expression (e.g. let str = "hello" +)
    for (let i = 0; i < formattedArray.length; i++) {
      if (!this.expressionIdentifier(formattedArray, i) && formattedArray.length > i + 1) {
        if (this.scopeEnterFunc(formattedArray, i + 1) === null
          && this.scopeExitFunc(formattedArray, i + 1) === null) {
          formattedArray[i + 1] = this.formatUnit + formattedArray[i + 1]
        }
      }
    }

    // Format comments correctly (some languages have special formatting for comments, e.g. Javadoc)
    formattedArray = this.formatCommentFunc(formattedArray)

    // If we don't have a snippet, return the result now
    if (!snippetPresent) {
      formattedArray = this._trimBeginning(formattedArray)
      return this._trimEnd(formattedArray)
    }

    // Format prefix and suffix
    let selection = this._splitSelection(formattedArray, snippet[0])
    let prefixResult = this._formatPrefix(scopeTree, selection[0],
      this.startSelection - selection[0].length)
    let suffixResult = this._formatSuffix(selection[2],
      this.endSelection + selection[2].length)
    let range = [prefixResult[1], suffixResult[1]]

    // Turn array into string
    let selectionString = ""
    if (selection[1].length > 0) {
      selectionString = selection[1].reduce(((acc, line) => acc + '\n' + line))
    }

    return [prefixResult[0], selectionString, suffixResult[0], range]
  }

  /**
   * Performs the following preliminary tasks:
   *  - Fills open comments
   *  - Removes extra method signatures (===> scope break so it will be removed later)
   *
   * @param snippet The snippet, as an array of lines, to work on.
   * @param selection The selection, as an array of lines, within the snippet.
   * @returns {Array} Array of pre-formatted lines.
   * @private
   */
  _preFormatSnippet(snippet, selection) {
    let splitSnippet = this._splitSelection(snippet, selection)
    let prefixArray = this._handleOpenComments(splitSnippet[0],
      this.startSelection - this.snippetOffset - 1)
    prefixArray = this._removeExtraMethodSigAbove(prefixArray)
    let suffixArray = this._removeExtraMethodSigBelow(splitSnippet[2])
    return prefixArray.concat(splitSnippet[1].concat(suffixArray))
  }

  /**
   * Format the prefix of a snippet. The prefix is defines as all lines above the
   * selection. Performs the following tasks:
   *  - Removes scopes that close but never open.
   *  - Removes empty lines at beginning of snippet.
   *
   * @param scopeTree The scope tree of the snippet.
   * @param array The formatted snippet as an array of lines.
   * @param oldStart The old start of the snippet in the original file
   *                 (line number, starting with 1 not 0).
   * @returns {Array} Formatted prefix string with the new beginning of the snippet
   *                in the original file (again index starting with 1).
   * @private
   */
  _formatPrefix(scopeTree, array, oldStart) {
    let originalLength = array.length

    let limit = scopeTree.getChildren()
      .filter(node => node.getStart() === null && node.getEnd() !== null)
      .filter(node => node.getEnd() < array.length)
      .reduce((limit, current) => Math.max(limit, current.getEnd()), -1)

    let result = []
    for (let i = limit + 1; i < array.length; i++) {
      result.push(array[i])
    }

    result = this._trimBeginning(result)
    let offset = originalLength - result.length

    if (result.length > 0) {
      result = result.reduce((acc, line) => acc + '\n' + line)
    } else {
      result = ""
    }

    return [result, oldStart + offset]
  }

  /**
   * Format the suffix of a snippet. The suffix is defines as all lines below the
   * selection. Performs the following tasks:
   *  - Removes methods and comments belonging to method below selection.
   *  - Removes empty lines at end of snippet.
   *
   * @param codeArray The formatted suffix as an array of lines.
   * @param oldEnd The old end of the snippet in the original file
   *               (line number, starting with 1 not 0).
   * @returns {Array} Formatted suffix string with the new end of the snippet
   *                in the original file (again index starting with 1).
   * @private
   */
  _formatSuffix(codeArray, oldEnd) {
    if (codeArray.length === 0) {
      return codeArray
    }

    let originalLength = codeArray.length
    let codeFound = false
    let index = codeArray.length - 1

    while (index >= 0) {
      let line = codeArray[index].trim()
      if (this.identifySpecialStatement(line) && line !== ''
        && (!line.trim().startsWith(this.simpleCommentToken.trim()) || !codeFound)) {
        codeArray.splice(index, 1)
      } else if (line !== '') {
        codeFound = true
      }

      index--
    }

    codeArray = this._trimEnd(codeArray)
    let offset = originalLength - codeArray.length

    // Make sure we don't reduce an empty array
    if (codeArray.length === 0) {
      return codeArray
    }

    return [codeArray.reduce(((acc, line) => acc + '\n' + line)), oldEnd - offset]
  }

  /**
   * Pre-formats an empty array by adding the indentations
   * (the specified format unit).
   *
   * @param array Array of lines of code.
   * @param node Node of the scope tree.
   * @private
   */
  _preFormatArray(array, node) {
    let start = node.getStart()
    let end = node.getEnd()

    if (start !== null && end !== null) {
      this._fillBucketRange(array, start + 1, end - 1)
    } else if (start === null && end !== null) {
      this._fillBucketRange(array, 0, end - 1)
    } else if (start !== null && end === null) {
      this._fillBucketRange(array, start + 1, array.length - 1)
    }

    node.getChildren().forEach(child => this._preFormatArray(array, child))
  }

  /**
   * Adds indentations to the array from the start to the end index, inclusive.
   *
   * @param array Array of lines of code.
   * @param start Start index of where to add indentations.
   * @param end End index of where to stop adding indentations.
   * @private
   */
  _fillBucketRange(array, start, end) {
    for (let i = start; i <= end; i++) {
      array[i] += this.formatUnit
    }
  }

  /**
   * If an open comment is met, take all lines necessary to close it
   * from the original file and append them to the snippet.
   *
   * @param codeArray Array of lines of code.
   * @param startLine The start line of the snippet in the original file.
   * @returns {Array} A snippet as an array of lines of code with no more
   *              open comments.
   * @private
   */
  _handleOpenComments(codeArray, startLine) {
    if (codeArray.length > 0 && startLine - 1 < this.fullCodeArray.length
      && codeArray[0].trim().startsWith(this.bodyCommentToken)) {
      codeArray.unshift(this.fullCodeArray[startLine - 1])
      return this._handleOpenComments(codeArray, startLine - 1)
    } else {
      return codeArray
    }
  }

  /**
   * Remove method signatures in the prefix that do not belong to the selection.
   *
   * @param codeArray Array of lines of code (prefix).
   * @returns {Array} Prefix with no more extra method signatures.
   * @private
   */
  _removeExtraMethodSigAbove(codeArray) {
    if (codeArray.length === 0) {
      return codeArray
    }

    let methodSigCount = 0
    let index = codeArray.length - 1
    while (index >= 0) {
      let line = codeArray[index].trim()
      if (this.identifyMethodSigFunc(line) && methodSigCount === 0) {
        methodSigCount++
      } else if (this.identifyMethodSigFunc(line) && methodSigCount === 1) {
        codeArray.splice(index, 1)
        methodSigCount++
      } else if (this.scopeEnterFunc([line], 0) !== null && index - 1 > 0
        && methodSigCount === 1) {
        if (this.identifyMethodSigFunc(codeArray[index - 1])) {
          codeArray.splice(index, 1)
          methodSigCount++
        }
      } else if (methodSigCount > 1) {
        codeArray.splice(index, 1)
      }

      index--
    }

    if (this.scopeEnterFunc([codeArray[0].trim()], 0) === 0) {
      codeArray.shift()
    }

    return codeArray
  }

  /**
   * Remove method signatures in the suffix that do not belong to the selection.
   *
   * @param codeArray Array of lines of code (suffix).
   * @returns {Array} Suffix with no more extra method signatures.
   * @private
   */
  _removeExtraMethodSigBelow(codeArray) {
    let index = 0
    let found = false
    while (index < codeArray.length) {
      let line = codeArray[index].trim()
      if (this.identifyMethodSigFunc(line) || found) {
        codeArray.splice(index, 1)
        found = true
      } else {
        index++
      }
    }

    return codeArray
  }

  /**
   * Removes empty lines at beginning of snippet.
   *
   * @param codeArray Array of lines of code.
   * @returns {Array} Code array with no empty lines at beginning.
   * @private
   */
  _trimBeginning(codeArray) {
    let canTrim = true

    while (canTrim && codeArray.length > 0) {
      let line = codeArray[0]
      if (line === "\n" || line.trim() === "") {
        codeArray.shift();
      } else {
        canTrim = false
      }
    }

    return codeArray
  }

  /**
   * Removes empty lines at end of snippet.
   *
   * @param codeArray Array of lines of code.
   * @returns {Array} Code array with no empty lines at end.
   * @private
   */
  _trimEnd(codeArray) {
    let canTrim = true

    while (canTrim && codeArray.length > 0) {
      let line = codeArray[codeArray.length - 1]
      if (line === "\n" || line.trim() === "") {
        codeArray.pop()
      } else {
        canTrim = false
      }
    }

    return codeArray
  }

  /**
   * Splits the code array into three parts: prefix, selection, suffix.
   *
   * Prefix: All lines above the selection.
   * Suffix: All lines below the selection.
   *
   * @param codeArray Array of lines of code.
   * @param selection Selection to split codeArray on.
   * @returns {Array} An array containing again the prefix, selection and suffix as
   *                arrays of lines of code.
   * @private
   */
  _splitSelection(codeArray, selection) {
    let startArray = []
    let selectionArray = []
    let endArray = []
    let selectionFound = false
    let selectionDone = false

    codeArray.forEach(line => {
      if (selection.length !== 0) {
        if (!selectionDone && selection.reduce((result, sLine) => result
            || line.includes(sLine.trim()), false)) {
          selectionFound = true
          selectionArray.push(line)
        } else if (selectionFound) {
          endArray.push(line)
          selectionDone = true
        } else {
          startArray.push(line)
        }
      }
    })

    return [startArray, selectionArray, endArray];
  }
}