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
     * @param formatUnit The token to be used for line indentations.
     */
    constructor(formatUnit) {
        this.formatUnit = formatUnit
        this.fullCodeArray = ''
        this.startSelection = 0
        this.endSelection = 0
        this.snippetOffset = 0
        this.bodyCommentToken = ''
        this.simpleCommentToken = ''

        this.expressionIdentifier = null
        this.scopeEnterFunc = null
        this.scopeExitFunc = null
        this.identifyMethodSigFunc = null
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
     *                             An expression is defined as:
     *                              - A line that ends with a termination token (e.g. ';')
     *                              - A line that defines a scope start (e.g. '{')
     *                              - A line that defines a scope end (e.g. '}')
     *                              - A line that starts with a special character (e.g. '@')
     *                              - A line that starts with a comment (e.g. '//')
     *                              - An empty line (e.g. '')
     * @param scopeEnterFunc Function that identifies if a new scope is entered in a line.
     * @param scopeExitFunc Function that identifies if a scope is exited in a line.
     * @returns {*} String with formatted code.
     */
    format(code, expressionIdentifier, scopeEnterFunc, scopeExitFunc) {
        return this.formatSnippet(code, null, null, null, expressionIdentifier, scopeEnterFunc,
            scopeExitFunc, null, null)
    }

    /**
     *
     * @param code
     * @param startRow
     * @param endRow
     * @param offset
     * @param expressionIdentifier
     * @param scopeEnterFunc
     * @param scopeExitFunc
     * @param identifyMethodSigFunc
     * @param identifySpecialStatement
     * @param bodyCommentToken
     * @param simpleCommentToken
     * @returns {*}
     */
    formatSnippet(code, startRow, endRow, offset, expressionIdentifier, scopeEnterFunc,
                  scopeExitFunc, identifyMethodSigFunc, identifySpecialStatement,
                  bodyCommentToken, simpleCommentToken) {
        // Initialize
        this.fullCodeArray = code.split('\n')
        this.startSelection = startRow
        this.endSelection = endRow
        this.snippetOffset = offset
        this.expressionIdentifier = expressionIdentifier
        this.scopeEnterFunc = scopeEnterFunc
        this.scopeExitFunc = scopeExitFunc
        this.identifyMethodSigFunc = identifyMethodSigFunc
        this.identifySpecialStatement = identifySpecialStatement
        this.bodyCommentToken = bodyCommentToken
        this.simpleCommentToken = simpleCommentToken

        let codeArray = this.fullCodeArray

        // In case we have a snippet, find the snippet
        let snippetPresent = this.startSelection !== null && this.endSelection !== null
            && offset !== null
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
     *
     * @param snippet
     * @param selection
     * @returns {Array.<T>|string}
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
     *
     * @param scopeTree
     * @param array
     * @param oldStart
     * @returns {*[]}
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
     *
     * @param codeArray
     * @param oldEnd
     * @returns {*[]}
     * @private
     */
    _formatSuffix(codeArray, oldEnd) {
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

        return [codeArray.reduce(((acc, line) => acc + '\n' + line)), oldEnd - offset]
    }

    /**
     *
     * @param array
     * @param node
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
     *
     * @param array
     * @param start
     * @param end
     * @private
     */
    _fillBucketRange(array, start, end) {
        for (let i = start; i <= end; i++) {
            array[i] += this.formatUnit
        }
    }

    /**
     *
     * @param codeArray
     * @param startLine
     * @returns {*}
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
     *
     * @param codeArray
     * @returns {*}
     * @private
     */
    _removeExtraMethodSigAbove(codeArray) {
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
     *
     * @param codeArray
     * @returns {*}
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
     *
     * @param codeArray
     * @returns {*}
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
     *
     * @param codeArray
     * @returns {*}
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
     *
     * @param codeArray
     * @param selection
     * @returns {*[]}
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