export default class ScopeTree {
    constructor(parent, start) {
        this.parent = parent
        this.children = []
        this.start = start
        this.end = null
    }

    getStart() {
        return this.start
    }

    getEnd() {
        return this.end
    }

    getParent() {
        return this.parent
    }

    getChildren() {
        return this.children
    }

    addChild(child) {
        this.children.push(child)
    }

    close(line)  {
        this.end = line
    }

    isClosed() {
        return this.start !== null && this.end !== null
    }

    balance() {
        for (let i = 0; i < this.getChildren().length; i++) {
            let child = this.getChildren()[i]

            // Check if there is a lone closing scope
            if (child.getStart() === null && child.getEnd() !== null) {
                // Pretend this lone closing scope had a matching opening scope at the beginning
                // and turn all previous siblings into children of the closing scope
                for (let j = 0; j < i; j++) {
                    let sibling = this.getChildren()[0]
                    this.getChildren().splice(0, 1)
                    child.addChild(sibling)
                }
            }

            child.balance()
        }
    }

    traverse(applyFunc, acc) {
        if (this.getChildren().length > 0) {
            return this.getChildren()
                .map(node => node.traverse(applyFunc, acc))
                .reduce((acc, node) => applyFunc(node, acc))
        } else {
            return applyFunc(this, acc)
        }
    }

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
                node = child // This allows us to check if the scope is closed in the same line and
                             // if not we pass on the child as the next node
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
                node = child // this avoids a null pointer exception when we call node.getParent() below
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
