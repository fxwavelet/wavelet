module.exports = function (options, imports, register) {
  var middlewareList = options.middlewares;

  var logger = imports.logger.getLogger('Wavelet');

  var express = imports.express;
  var webapp = imports.webapp;
  var server = imports.server;
  var middlewares = imports.middlewares.all(middlewareList);
  var RED = imports.red;


  var argv = options.argv;

  /* apply all middlewares */
  var key = null;
  for (var i = 0; i < middlewares.length; i++) {
    key = middlewares[i][0];
    if (argv.d) {
      logger.info("Installing middleware", key);
    }
    webapp.use(middlewares[i][1]);
  }


  var port = argv.port || 8080;
  server.listen(port, function (err) {
    if (!argv.disableEditor || !argv.disableRED) {
      RED.start();
    }

    logger.info('Wavelet app is running at port ' + port);
  });

  register(null, {
    "waveletApp": webapp
  });
};