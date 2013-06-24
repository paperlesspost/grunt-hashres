/*
 * grunt-hashres
 * https://github.com/luismahou/grunt-hashres
 *
 * Copyright (c) 2012 Luismahou
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  // Loading necessary modules
  var fs     = require('fs'),
      path   = require('path'),
      crypto = require('crypto'),
      helper = require('./hashresHelper');

  grunt.registerMultiTask(
      'hashres',
      'Hashes your resources and updates the files that refer to them',
      function() {
    // Required properties: 'src' and 'out'
    this.requiresConfig(this.name + '.' + this.target + '.src');
    this.requiresConfig(this.name + '.' + this.target + '.out');
    var options = this.options({
      encoding: 'utf8',
      fileNameFormat: '${hash}.${name}.cache.${ext}',
      renameFiles: true,
      writeManifest: false,
      manifestName: 'FileManifest',
      manifestFile: 'manifest.js',
      baseDir: null,
      httpDir: null
    });
    helper.hashAndSub(grunt, options);
  });
};
