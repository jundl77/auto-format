import JavaFormatter from "./javaFormatter"

module.exports = function() {
    /**
     *
     * @param spacing
     * @returns {JavaFormatter}
     */
    const createJavaFormatter = function(spacing) {
        return new JavaFormatter(spacing)
    }
};