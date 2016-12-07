// An example configuration file.
exports.config = {
    // Do not start a Selenium Standalone sever - only run this using chrome.
    chromeOnly: true,
    //chromeDriver: 'node_modules/protractor/selenium/chromedriver',
    seleniumServerJar: 'node_modules/protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar',

    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:8080/',

    // Spec patterns are relative to the current working directly when
    // protractor is called.
    specs: ['test/*.js'],

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    }
};