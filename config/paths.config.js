var jsSourceWithUnitTests = 'src/app/**/*.js';
var unitTests = 'src/app/**/*.spec.js';
var jsSource = [jsSourceWithUnitTests, '!' + unitTests];

var paths = {
    srcFolder: 'src',
    jsSourceWithUnitTests: jsSourceWithUnitTests,
    jsSource: jsSource,
    unitTests: unitTests,
    karmaConfigFile: 'config/karma.config.js',
    e2eTests: 'test-e2e/**/*.spec.js',
    pageObjects: 'test-e2e/**/*.page.js',
    protractorConfigFile: 'config/protractor.config.js',
    mockBackendData: 'src/mock-backend/data/**/*.js'
};

module.exports = paths;