import {expect} from "chai"
import {it, describe} from "mocha"
import formatters from "../src/index"
import javaTests from "./resources/javaTests"

describe("Perform black-box tests on all formatters\n", () => {
  describe("Language: Java\n", () => {
    let formatter = formatters.createJavaFormatter(javaTests.indentationToken)
    blackBoxTest(formatter, javaTests)
  })
})

function blackBoxTest(formatter, json) {
  json.tests.forEach(test => {
    it("Test case: " + test.label, () => {
      let formatResult = formatter.format(test.code)
      console.log("FORMAT RESULT FOR TEST CASE: " + test.label + "\n")
      console.log(formatResult)
      console.log("\n")

      let formatSnippetResultArrays = formatter.formatSnippet(test.code,
        test.selectionStart, test.selectionEnd, test.offset)
      console.log("FORMAT SNIPPET RESULT FOR TEST CASE: " + test.label + "\n")
      console.log(formatSnippetResultArrays)
      console.log("\n")

      // Check that selection was done correctly
      let selectionArray = formatSnippetResultArrays[1].split('\n')
      expect(selectionArray.length).to.equal(test.selection.length)
      for (let i = 0; i < test.selection.length; i++) {
        expect(selectionArray[i].trim()).to.equal(test.selection[i])
      }

      // Check that new start line and end line of snippet are correct
      let newSnippetStart = formatSnippetResultArrays[3][0]
      let newSnippetEnd = formatSnippetResultArrays[3][1]
      expect(newSnippetStart).to.equal(test.newSnippetStart)
      expect(newSnippetEnd).to.equal(test.newSnippetEnd)

      // Check that each line has been formatted correctly with the format method
      let controlArray = test.formatResult.split('\n');
      expect(controlArray.length).to.equal(formatResult.length)
      for (let i = 0; i < controlArray.length; i++) {
        expect(formatResult[i]).to.equal(controlArray[i])
      }

      // Check that each line has been formatted correctly with the formatSnippet method
      let formatSnippetResult = formatSnippetResultArrays[0].split('\n').concat(formatSnippetResultArrays[1]
        .split('\n').concat(formatSnippetResultArrays[2].split('\n')))
      let controlSnippetArray = test.formatSnippetResult.split('\n');
      expect(formatSnippetResult.length).to.equal(controlSnippetArray.length)
      for (let i = 0; i < controlSnippetArray.length; i++) {
        expect(formatSnippetResult[i]).to.equal(controlSnippetArray[i])
      }
    })
  })
}
