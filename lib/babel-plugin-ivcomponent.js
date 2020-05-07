const visitor = {
  ExportDefaultDeclaration(path) {
    console.log(path);
  }
}

module.exports = function(babel) {
  return {
    visitor
  }
}