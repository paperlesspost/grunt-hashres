/*
 * grunt-hashres
 * https://github.com/luismahou/grunt-hashres
 *
 * Copyright (c) 2012 Luismahou
 * Licensed under the MIT license.
 */

var fs    = require('fs'),
    path  = require('path'),
    utils = require('./hashresUtils');

var setupDefaultOptions = function(options) {
  return {
    files: Array.isArray(options.files) ? options.files : [options.files],
    out: Array.isArray(options.out) ? options.out: [options.out],
    encoding: (options.encoding || 'utf8'),
    fileNameFormat: (options.fileNameFormat || '${hash}.${name}.cache.${ext}'),
    renameFiles: (options.renameFiles === undefined ? true : false),
    manifestName: options.manifestName || "FileManifest",
    manifestFile: options.manifestFile || "manifest.js",
    writeManifest: options.writeManifest || false,
    baseDir: options.baseDir || null,
    httpDir: options.httpDir || null
  };
};

var buildHashMapping = function(grunt, options) {
  var nameToHashedName = {},
      formatter        = null;

  formatter = utils.compileFormat(options.fileNameFormat);

  // Renaming the files using a unique name
  grunt.file.expand(options.files).forEach(function(f) {
    var fileName = path.basename(f), md5, lastIndex, renamed;
    if (options.baseDir) {
      fileName = f.replace(options.baseDir, options.httpDir || '');
    }
    md5 = utils.md5(f).slice(0, 8);
    lastIndex = fileName.lastIndexOf('.');
    renamed = formatter({
      hash: md5,
      name: fileName.slice(0, lastIndex),
      ext: fileName.slice(lastIndex + 1, fileName.length)
    });

    // Mapping the original name with hashed one for later use.
    nameToHashedName[fileName] = renamed;

    // Renaming the file
    if(options.renameFiles) {
      fs.renameSync(f, path.resolve(path.dirname(f), renamed));
    }
    grunt.log.write(f + ' ').ok(renamed);
  });

  return nameToHashedName;
};

var writeManifest = function(grunt, options, nameToHashedName) {
  grunt.log.ok('writing manifest to ' + options.manifestFile);
  grunt.file.write(options.manifestFile, options.manifestName + " = " + JSON.stringify(nameToHashedName, null, "  ") + ";", options.encoding);
};

exports.hashAndSub = function(grunt, options) { //files, out, encoding, fileNameFormat) {
  options = setupDefaultOptions(options);
  var files            = options.files,
      out              = options.out,
      encoding         = options.encoding,
      fileNameFormat   = options.fileNameFormat,
      renameFiles      = options.renameFiles,
      nameToHashedName = {};

  grunt.log.ok('out: ' + out);
  grunt.log.debug('Using encoding ' + encoding);
  grunt.log.debug('Using fileNameFormat ' + fileNameFormat);
  grunt.log.debug(renameFiles ? 'Renaming files' : 'Not renaming files');

  nameToHashedName = buildHashMapping(grunt, options);

  // Substituting references to the given files with the hashed ones.
  grunt.file.expand(out).forEach(function(f) {
    var outContents = fs.readFileSync(f, encoding);
    for (var name in nameToHashedName) {
      grunt.log.debug('Substituting ' + name + ' by ' + nameToHashedName[name]);
      outContents = outContents.replace(name, nameToHashedName[name]);
    }
    grunt.log.debug('Saving the updated contents of the outination file');
    fs.writeFileSync(f, outContents, encoding);
  });

  if (options.writeManifest) {
    writeManifest(grunt, options, nameToHashedName);
  }
};
