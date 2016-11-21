import JavaFormatter from "./javaFormatter"

const Formatter = {
    createJavaFormatter(spacing) {
        return new JavaFormatter(spacing)
    },

    testModule() {
        console.log("I am working")
    }
}

export default Formatter
