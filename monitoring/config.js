/*
 * Create and export configuration
 *
 */

// container for all environments
const environments = {};


// Staging (default) environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
};


// Production environments
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
};


// Determine which environment was passed at cmd line
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';


// Check that current is defined above
const environmentToExport = typeof(environments[currentEnvironment]) == 'object'
    ? environments[currentEnvironment]
    : environments.staging;


module.exports = environmentToExport;
