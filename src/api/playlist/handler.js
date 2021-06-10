const { validateError } = require('../../utils/index');

class PlaylistsHandler {
  constructor(playlistService, userService, validator) {
    this._playlistService = playlistService;
    this._userService = userService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);

      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;

      const playlistId = await this._playlistService.addPlaylists({ name, owner });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { id } = request.auth.credentials;
      const playlists = await this._playlistService.getPlaylists(id);

      const response = {
        status: 'success',
        data: {
          playlists,
        },
      };
      return response;
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: owner } = request.auth.credentials;
      await this._playlistService.deletePlaylistsById(playlistId, owner);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }
}

module.exports = PlaylistsHandler;