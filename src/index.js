import JavaFormatter from "./formatters/javaFormatter"

const Formatter = {
    /**
     * Create an auto-formatter for java code.
     *
     * @param formatUnit The token to be used for line indentations. (ex. "  " or "    ")
     * @returns {JavaFormatter} Auto-formatter for java code.
     */
    createJavaFormatter(formatUnit) {
        return new JavaFormatter(formatUnit)
    },

    /**
     * Tests if the module is working correctly by printing out a string.
     */
    testModule() {
        console.log("I am working")
    }
}

export default Formatter
