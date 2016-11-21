import JavaFormatter from "./javaFormatter"

export default Formatter = {
    createJavaFormatter(spacing) {
        return new JavaFormatter(spacing)
    },

    testModule() {
        console.log("I am working")
    }
}
