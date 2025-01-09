module.exports = {
  devServer: {
    host: '0.0.0.0', // Allow access from external devices
    port: 8080,      // Specify the port
    allowedHosts: 'all', // Allow all hosts
    // allowedHosts: ['your-custom-domain.com'], // Allow specific domains
  }
};