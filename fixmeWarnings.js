#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

if (!process.argv[2]) {
  console.log("\nUSAGE:")
  console.log("fixmeWarnings.js [DIRECTORY/FILE]\n")
  process.exit(0);
}

let absPath = path.resolve(process.argv[2]);
if (!fs.existsSync(absPath)) {
  console.error(`Path ${absPath} does not exist.`);
  process.exit(1);
}

main(absPath);

function main(pth) {
  if (fs.lstatSync(absPath).isFile()) {
    forEachLineInFile(absPath, (line, lineNumber) => {
      const matches = /\/\/ ?FIXME\:(.*)/g.exec(line);
      if (matches) {
        console.warn(`\x1b[1;37;41m FIXME \x1b[0m ${absPath}:${lineNumber + 1}` + (matches[1].length > 1 ? `  --- ${matches[1]}` : ""));
      }
    })
  } else {
    fs.readdir(pth, { encoding: "utf8", recursive: true }, (err, files) => {
      if (err === null) {
        files.forEach(file => {
          file = path.join(absPath, file);
          const stats = fs.lstatSync(file);
          if (stats.isFile()) {
            forEachLineInFile(file, (line, lineNumber) => {
              const matches = /\/\/ ?FIXME\:(.*)/g.exec(line);
              if (matches) {
                console.warn(`\x1b[1;37;41m FIXME \x1b[0m ${file}:${lineNumber + 1}` + (matches[1].length > 1 ? `  --- ${matches[1]}` : ""));
              }
            })
          }
        });
      } else {
        throw err;
      }
    });
  }
}

function forEachLineInFile(pth, fn) {
  fs.readFile(pth, { encoding: "utf8" }, (err, data) => {
    if (err === null) {
      data.split("\n").forEach((val, i) => {
        fn(val, i);
      })
    } else {
      throw err;
    }
  })
}
