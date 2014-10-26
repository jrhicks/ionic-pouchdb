var express   = require('express'),
    lrServer = require('tiny-lr');
    es = require('event-stream'),
    connect = require("connect"),
    util = require("gulp-util"),
    proxyMiddleware = require('proxy-middleware'),
    connectSlow = require('connect-slow'),
    lrScript = require('connect-livereload');

var LIVERELOAD_PORT = 35729;
var expressServer = express();
var reloadServer = lrServer();

slowOptions = {
    url: /_api/,
    delay: 300
    }

proxyOptions = {
    protocol: 'http:',
    slashes: true,
    host: 'localhost:6001',
    port: '6001',
    hostname: 'localhost',
    pathname: '/_api',
    path: '/_api',
    href: 'http://localhost:6001/_api'
}

var run = function(port, directory) {
    expressServer.use(lrScript());
    expressServer.use('/_api', proxyMiddleware(proxyOptions));
    expressServer.use(connect.logger("dev"));
    expressServer.use(express.static(process.cwd() + directory));
    expressServer.use(connect.static('public')).listen(9000, '0.0.0.0');
    reloadServer.listen(LIVERELOAD_PORT);
};

var livereloadChanged = function() {
    return es.map(function(file, callback) {
        reloadServer.changed({
            body: {
                files: file.path
            }
        });
        return callback(null, file);
    });
}

module.exports = {
    run: run,
    reload: livereloadChanged
}
