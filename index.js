/**
 * Module dependencies.
 */
var postcss = require("postcss")
var parser = require("postcss-value-parser")
var colorFn = require("css-color-function")
var helpers = require("postcss-message-helpers")

/**
 * PostCSS plugin to transform color()
 */
module.exports = postcss.plugin("postcss-color-function", function() {
  return function(style) {
    style.walkDecls(function transformDecl(decl) {
      if (!decl.value || decl.value.indexOf("color(") === -1) {
        return
      }

      decl.value = helpers.try(function transformColorValue() {
        return transformColor(decl.value, decl.source)
      }, decl.source)
    })
  }
})

/**
 * Transform color() to rgb()
 *
 * @param  {String} string declaration value
 * @return {String}        converted declaration value to rgba()
 */
function transformColor(string, source) {
  var parsed = parser(string);

  parsed.walk(function (node) {
    if (node.type !== 'function' || node.value !== 'color') return

    node.value = colorFn.convert("color(" + parser.stringify(node.nodes) + ")")
    node.type = 'word'
    delete(node.nodes)
  })

  return parsed.toString()
}
