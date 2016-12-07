exports.config = {
    // if using seleniumServerJar, do not specify seleniumAddress !!!
    seleniumServerJar: './node_modules/protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar',
    //port of the server
    seleniumPort: 4444,
    seleniumArgs: ['-browserTimeout=60'],
    //seleniumAddress: 'http://localhost:4444/wd/hub',
    framework: 'jasmine',
    troubleshoot: false, //true if you want to see actual web-driver configuration
    capabilities: {
        'browserName': 'phantomjs',
        //Can be used to specify the phantomjs binary path.
        //This can generally be ommitted if you installed phantomjs globally.
        'phantomjs.binary.path': require('phantomjs').path,
        'phantomjs.cli.args': ['--ignore-ssl-errors=true', '--web-security=false']
    },

    specs: ['test/*.js'], //path to the test specs
    allScriptsTimeout: 60000,
    getPageTimeout: 60000,
    baseUrl: 'http://localhost:8080/',

    // Options to be passed to Jasmine-node.
    onPrepare: function () {
            // The require statement must be down here, since jasmine-reporters@1.0
            // needs jasmine to be in the global and protractor does not guarantee
            // this until inside the onPrepare function.
            var jasmineReporters = require('jasmine-reporters');
            jasmine.getEnv().addReporter(
                new jasmineReporters.JUnitXmlReporter('xmloutput', true, true)
            );
    },
    //Jasmine configuration
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 60000,
        isVerbose: false,
        includeStackTrace: false
    },
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']


};