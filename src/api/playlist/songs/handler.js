const { validateError } = require('../../../utils/index');

class PlaylistsSongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getSongsInPlayListHandler = this.getSongsInPlayListHandler.bind(this);
    this.deleteSongInPlaylistByIdHandler = this.deleteSongInPlaylistByIdHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      await this._validator.validatePlaylistSongsPayload(request.payload);

      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: owner } = request.auth.credentials;

      await this._service.addSongToPlaylist({ playlistId, songId, owner });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });
      response.code(201);
      return response;
    } catch (error) {
      return validateError(error, h);
    }
  }

  async getSongsInPlayListHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: owner } = request.auth.credentials;
      const songs = await this._service.getSongInPlaylists(playlistId, owner);

      const response = {
        status: 'success',
        data: {
          songs,
        },
      };
      return response;
    } catch (error) {
      return validateError(error, h);
    }
  }

  async deleteSongInPlaylistByIdHandler(request, h) {
    try {
      await this._validator.validatePlaylistSongsPayload(request.payload);

      const { songId } = request.payload;
      const { playlistId } = request.params;
      const { id: owner } = request.auth.credentials;
      await this._service.deleteSongInPlaylistById(playlistId, songId, owner);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      return validateError(error, h);
    }
  }
}

module.exports = PlaylistsSongHandler;
