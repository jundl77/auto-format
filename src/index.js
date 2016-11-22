import JavaFormatter from "./formatters/javaFormatter"

/**
 * The 'main class' of the module. Here formatters for various languages can be created.
 * As of right now, only Java is available.
 *
 * The <code>formatUnit</code> is always the token to be used for line indentations (ex. 2 spaces and 4 spaces).
 *
 * <strong>Available functions:</strong>
 * - <pre><code>JavaFormatter createJavaFormatter(formatUnit:String)</code></pre>
 *
 */
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
