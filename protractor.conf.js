//jshint strict: false
exports.config = {

  seleniumServerJar: './node_modules/selenium-server-standalone-jar/jar/selenium-server-standalone-2.53.1.jar',
    seleniumPort: 4444,
  allScriptsTimeout: 11000,

    specs: ['test/e2e/*.js'],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }

};
