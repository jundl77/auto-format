import JavaFormatter from "./javaFormatter"

export default class Formatter {
    constructor(spacing) {
        this.spacing = spacing;
        this.javaFormatter = null
    }

    getJavaFormatter() {
        if (this.javaFormatter === null) {
            this.javaFormatter = new JavaFormatter(this.spacing)
        }
        return this.javaFormatter
    }

    testModule() {
        console.log("I am working")
    }
}

