/**
 * A scope tree is a tree that captures the scope of a piece of code. A node
 * contains the start and end of the scope. If start or end is null then the
 * start or end is not in the code. A parent node contains all scopes inside
 * it as children nodes.
 */
export default class ScopeTree {

    /**
     * Creates a new node.
     *
     * @constructor
     * @param parent The parent node.
     * @param start The start of the scope of this node.
     */
    constructor(parent, start) {
        this.parent = parent
        this.children = []
        this.start = start
        this.end = null
    }

    /**
     * Get the start of the scope.
     *
     * @returns {*|null} The start of the scope, or null if not defined.
     */
    getStart() {
        return this.start
    }

    /**
     * Get the end of the scope.
     *
     * @returns {*|null} The end of the scope, or null if not defined.
     */
    getEnd() {
        return this.end
    }

    /**
     * Get the parent of this node. Returns null if this is the root node.
     *
     * @returns {*} The parent of this node, or null if this is the root node.
     */
    getParent() {
        return this.parent
    }

    /**
     * Get an array of all children of this node.
     *
     * @returns {Array} An array of all children of this node.
     */
    getChildren() {
        return this.children
    }

    /**
     * Add a child to this node.
     *
     * @param child The child to add to this node, should also be of type ScopeTree.
     */
    addChild(child) {
        this.children.push(child)
    }

    /**
     * Close this scope. This means the end of the scope has been reached.
     *
     * @param line The line that the scope ends at.
     */
    close(line)  {
        this.end = line
    }

    /**
     * Returns true if the scope of this node is closed (meaning the scope has
     * a start and an end point)
     *
     * @returns {boolean} True if the scope for this node is defined, else false.
     */
    isClosed() {
        return this.start !== null && this.end !== null
    }

    /**
     * Balance the tree. This enforces an ordering of the nodes in the tree such
     * that parent nodes are always 1 scope above their child nodes.
     *
     * By nature, the tree will be built in a balanced fashion. However because
     * we might be dealing with snippets of code scope entries or exits (i.e. brackets)
     * might be missing, which puts the tree out of balance. This method fixes that.
     *
     * Particularly, this moves all left siblings of a node that only has an end
     * but not a start under it, making them his children.
     *
     * Example:
     * <pre><code>
     *  <-> : scope is open and closed
     *  <-  : scope is only opened but not closed
     *   -> : scope is only closed but never opened
     *
     * IMBALANCED TREE                BALANCED TREE
     *  -root-                         -root-
     *    |                              |
     *    |---------------               |-----
     *    |    |    |    |               |    |
     *    |    |    |    |               |    |
     *   <->  <->   ->  <-    =======>   ->  <-
     *                                   |
     *    ^    ^    ^    ^               |-----
     *    |    |    |    |               |    |
     *   ok   ok   not  ok               |    |
     *             ok                   <->  <->
     * </code></pre>
     */
    balance() {
        for (let i = 0; i < this.getChildren().length; i++) {
            let child = this.getChildren()[i]

            // Check if there is a lone closing scope
            if (child.getStart() === null && child.getEnd() !== null) {

                /* Pretend this lone closing scope had a matching opening scope at the
                 * beginning and turn all previous siblings into children of the closing
                 * scope.
                 */
                for (let j = 0; j < i; j++) {
                    let sibling = this.getChildren()[0]
                    this.getChildren().splice(0, 1)
                    child.addChild(sibling)
                }
            }

            child.balance()
        }
    }

    /**
     * Builds the scope tree. This function is designed in such a way that it can
     * build scope trees over a variety of different programming languages. That
     * is why as a parameter, the function takes two functions, each which
     * determine where the scope starts or ends in a current line, if it does at
     * all. These functions NEED to have the following signatures:
     *
     * Index:Integer scopeEnterFunc(arrayOfAllLines:Array, lineToCheckIndex:Integer)
     * Index:Integer scopeExitFunc(arrayOfAllLines:Array, lineToCheckIndex:Integer)
     *
     * Both functions take the full array of lines and the index of the line to
     * examine, and return the column within the line at which the scope is entered
     * or exited. If there is no scope change in the line, null must be returned.
     *
     * @param lines Array of lines to build the scope tree over.
     * @param index Current line number.
     * @param scopeEnterFunc Function with the above signature. It takes the full
     *        array of lines and the index of the line to examine, and returns
     *        the column within the line at which the scope is entered. If no scope
     *        is entered in the line, null must be returned.
     * @param scopeExitFunc Function with the above signature. It takes the full
     *        array of lines and the index of the line to examine, and returns
     *        the column within the line at which the scope is exited. If no scope
     *        is exited in the line, null must be returned.
     * @returns {*} The root node of the scope tree.
     */
    build(lines, index, scopeEnterFunc, scopeExitFunc) {
        let node = this
        if (lines.length === 0) {
            if (node.getParent() !== null) {
                return node.getParent().build([], index, scopeEnterFunc, scopeExitFunc);
            } else {
                return node
            }
        }

        let enterIndex = scopeEnterFunc(lines, 0)
        let exitIndex = scopeExitFunc(lines, 0)
        let line = lines.shift()

        if (enterIndex !== null && (enterIndex < exitIndex || exitIndex === null)) {
            let child = new ScopeTree(node, index)
            node.addChild(child)

            let remaining = line.substr(enterIndex + 1);
            if (scopeEnterFunc([remaining], 0) !== null) {
                lines.unshift(remaining)
                return child.build(lines, index, scopeEnterFunc, scopeExitFunc)
            } else {
                node = child // This allows us to check if the scope is closed in the
                             // same line and if not we pass on the child as the next node
            }
        } else if (enterIndex !== null && exitIndex !== null) {
            // Check for this case: } foo {
            if (node.getParent() === null) {
                let child = new ScopeTree(node, null)
                child.close(index)
                node.addChild(child)
                node = child
            } else {
                node.close(index)
            }

            let remaining = line.substr(exitIndex + 1)
            lines.unshift(remaining)
            return node.getParent().build(lines, index, scopeEnterFunc, scopeExitFunc)
        }

        if (exitIndex !== null) {
            if (node.getParent() === null) {
                let child = new ScopeTree(node, null)
                child.close(index)
                node.addChild(child)
                node = child // This avoids a null pointer exception when we call
                             // node.getParent() below
            } else {
                node.close(index)
            }

            let remaining = line.substr(exitIndex + 1)

            if (scopeExitFunc([remaining], 0) !== null) {
                lines.unshift(remaining)
                return node.getParent().build(lines, index, scopeEnterFunc, scopeExitFunc)
            } else {
                node = node.getParent()
            }
        }

        return node.build(lines, index + 1, scopeEnterFunc, scopeExitFunc)
    }
}
