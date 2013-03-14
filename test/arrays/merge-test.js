var vows = require("vows"),
    load = require("../load"),
    assert = require("../env-assert");

var suite = vows.describe("d3.merge");

suite.addBatch({
  "merge": {
    topic: load("arrays/merge"),
    "merges an array of arrays": function(d3) {
      var a = {}, b = {}, c = {}, d = {}, e = {}, f = {};
      assert.deepEqual(d3.merge([[a], [b, c], [d, e, f]]), [a, b, c, d, e, f]);
    },
    "returns a new array": function(d3) {
      var input = [[1, 2, 3], [4, 5], [6]];
      assert.isFalse(d3.merge(input) === input);
    },
    "does not modify the input arrays": function(d3) {
      var input = [[1, 2, 3], [4, 5], [6]];
      d3.merge(input);
      assert.deepEqual(input, [[1, 2, 3], [4, 5], [6]]);
    }
  }
});

suite.export(module);
