const routes = (handler) => [
  {
    method: 'POST',
    path: '/exports/playlists/{playlistId}',
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
];

module.exports = routes;
