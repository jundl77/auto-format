import JavaFormatter from "./javaFormatter"

module.exports = {
    /**
     *
     * @param spacing
     * @returns {JavaFormatter}
     */
    createJavaFormatter: function(spacing) {
        return new JavaFormatter(spacing)
    }
};