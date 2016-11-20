import JavaFormatter from "./javaFormatter"

module.exports = function() {
    /**
     *
     * @param spacing
     * @returns {JavaFormatter}
     */
    this.createJavaFormatter = function(spacing) {
        return new JavaFormatter(spacing)
    }
};