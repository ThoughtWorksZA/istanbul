/*
 Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var path = require('path'),
    Report = require('./index'),
    FileWriter = require('../util/file-writer'),
    TreeSummarizer = require('../util/tree-summarizer'),
    utils = require('../object-utils');

/**
 * a `Report` implementation that produces a clover XML file that conforms to the
 *
 * Usage
 * -----
 *
 *      var report = require('istanbul').Report.create('clover');
 *
 * @class CloverReport
 * @extends Report
 * @constructor
 * @param {Object} opts optional
 * @param {String} [opts.dir] the directory in which to the clover.xml will be written
 */
function CloverReport(opts) {
    Report.call(this);
    opts = opts || {};
    this.projectRoot = process.cwd();
    this.dir = opts.dir || this.projectRoot;
    this.file = opts.file || 'clover.xml';
    this.opts = opts;
}

CloverReport.TYPE = 'clover';

function quote(thing) {
    return '"' + thing + '"';
}

function attr(n, v) {
    return ' ' + n + '=' + quote(v) + ' ';
}

function walk(node, writer, level) {
    var metrics;
    if (level === 0) {
        metrics = node.metrics;
        writer.println('<?xml version="1.0" ?>');
        writer.println('<coverage' +
            attr('generated', Date.now()) +
            attr('clover', '3.1.12') +
            '>');
        writer.println('<project' +
            attr('timestamp', Date.now()) +
            '>');
        writer.println('\t<metrics' +
            attr('elements', metrics.lines.total) +
            attr('coveredelements', metrics.lines.covered) +
            attr('ncloc', metrics.lines.total) +
            '></metrics>');
        writer.println('</project>');
        writer.println('</coverage>');
    }
}

Report.mix(CloverReport, {
    writeReport: function (collector, sync) {
        var summarizer = new TreeSummarizer(),
            outputFile = path.join(this.dir, this.file),
            writer = this.opts.writer || new FileWriter(sync),
            tree,
            root;

        collector.files().forEach(function (key) {
            summarizer.addFileCoverageSummary(key, utils.summarizeFileCoverage(collector.fileCoverageFor(key)));
        });
        tree = summarizer.getTreeSummary();
        root = tree.root;
        writer.writeFile(outputFile, function (contentWriter) {
            walk(root, contentWriter, 0);
        });
    }
});

module.exports = CloverReport;
