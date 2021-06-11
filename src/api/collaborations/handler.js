const { validateError } = require('../../utils/index');

class CollaborationsHandler {
  constructor(collaborationsService, playlistSongService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistSongService = playlistSongService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: owner } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistSongService.verifyPlaylistsOwner(playlistId, owner);

      const collaborationId = await
      this._collaborationsService.addCollaboration(playlistId, userId);

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      await this._validator.validateCollaborationPayload(request.payload);
      const { id: owner } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistSongService.verifyPlaylistsOwner(playlistId, owner);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      const response = validateError(error, h);

      return response;
    }
  }
}

module.exports = CollaborationsHandler;
