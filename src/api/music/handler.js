const { validateError } = require('../../utils/index');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title, year, performer, genre, duration,
      } = request.payload;

      const songId = await this._service.addSong({
        title, year, performer, genre, duration,
      });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async getSongsHandler(_, h) {
    try {
      const songs = await this._service.getSongs();

      const response = {
        status: 'success',
        data: {
          songs,
        },
      };
      return response;
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;
      const song = await this._service.getSongById(songId);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { songId } = request.params;

      await this._service.editSongById(songId, request.payload);

      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      };
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;
      await this._service.deleteSongById(songId);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }
}

module.exports = SongsHandler;
