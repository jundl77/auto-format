import JavaFormatter from "./javaFormatter"

export default function () {
    this.createJavaFormatter = function (spacing) {
        return new JavaFormatter(spacing)
    }

    this.testModule = function () {
        console.log("I am working")
    }
}

