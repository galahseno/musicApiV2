const MusicsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'apimusicv1',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new MusicsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};
