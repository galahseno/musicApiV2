const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { playlistService, userService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(playlistService, userService, validator);
    server.route(routes(playlistsHandler));
  },
};
