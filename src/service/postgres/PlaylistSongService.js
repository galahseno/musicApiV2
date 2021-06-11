const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationService = collaborationsService;
  }

  async addSongToPlaylist({ playlistId, songId, owner }) {
    const id = `playlistSong-${nanoid(16)}`;
    await this.verifyPlaylistSongAccess(playlistId, owner);
    await this.verifySongId(songId);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongInPlaylists(playlistId, owner) {
    await this.verifyPlaylistSongAccess(playlistId, owner);

    const query = {
      text: `SELECT apimusicv2.id, apimusicv2.title, apimusicv2.performer
            FROM apimusicv2
            LEFT JOIN playlistsongs ON playlistsongs.song_id = apimusicv2.id
            WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongInPlaylistById(playlistId, songId, owner) {
    await this.verifySongId(songId);
    await this.verifyPlaylistSongAccess(playlistId, owner);
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async verifySongId(songId) {
    const query = {
      text: 'SELECT * FROM apimusicv2 WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('songId tidak ditemukan');
    }
  }

  async verifyPlaylistsOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistSongAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistsOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongService;
