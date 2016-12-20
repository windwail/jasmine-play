module.exports = function(config) {
    config.set({
        framework: ['jasmine'],
        browsers: ['Firefox'],
        files: [
            'test/unit/*.js'
        ]

    });
};