#!/usr/bin/env node

var fm = require("./formality.js");
var fs = require("fs");
var path = require("path");
var {fmc_to_js} = require("FormCore-lang");

if (!process.argv[2] || process.argv[2] === "--help" || process.argv[2] === "-h") {
  console.log("# Formality");
  console.log("");
  console.log("Usage:");
  console.log("");
  console.log("  fmfm <file>       # type-checks a file");
  console.log("  fmfm <main> --fmc # compiles to FormCore");
  console.log("  fmfm <main> --js  # compiles to JavaScript");
  console.log("  fmfm <main> --run # runs with JavaScript");
  console.log("");
  console.log("Examples:");
  console.log("");
  console.log("  # Check all types inside a file:");
  console.log("  fmfm example.fmfm");
  console.log("");
  console.log("  # Compile to JS, with 'main' as the entry point:");
  console.log("  fmfm --js main");
  process.exit();
}

(async () => {
  var name = process.argv[2];

  // FormCore compilation
  if (process.argv[3] === "--fmc") {
    console.log(await fm.run(fm["Fm.to_core.io.one"](name)));

  // JavaScript compilation
  } else if (process.argv[3] === "--js") {
    var module = process.argv[4] === "--module";
    try {
      var fmcc = await fm.run(fm["Fm.to_core.io.one"](name));
      console.log(fmc_to_js.compile(fmcc, name, {module}));
    } catch (e) {
      console.log("Compilation error.");
      console.log(e);
    }

  // JavaScript execution
  } else if (process.argv[3] === "--run") {
    try {
      var fmcc = await fm.run(fm["Fm.to_core.io.one"](name));
      var asjs = fmc_to_js.compile(fmcc, name, {});
      var js_path = path.join(__dirname,"_formality_tmp_.js");
      try { fs.unlinkSync(js_path); } catch (e) {};
      fs.writeFileSync(js_path, asjs);
      require(js_path);
      fs.unlinkSync(js_path);
    } catch (e) {
      console.log("Compilation error.");
      console.log(e);
    }

  // Type-Checking
  } else {
    if (name.slice(-3) !== ".fm" && name.slice(-5) !== ".fmfm") {
      fm.run(fm["Fm.checker.io.one"](name));
    } else if (name) {
      fm.run(fm["Fm.checker.io.file"](name));
    }
  }
})();
