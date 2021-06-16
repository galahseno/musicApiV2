const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongService {
  constructor(musicService, playlistService, collaborationsService) {
    this._pool = new Pool();
    this._musicService = musicService;
    this._playlistService = playlistService;
    this._collaborationService = collaborationsService;
  }

  async addSongToPlaylist({ playlistId, songId, owner }) {
    const id = `playlistSong-${nanoid(16)}`;
    await this.verifyPlaylistSongAccess(playlistId, owner);
    await this._musicService.verifySongId(songId);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
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
    await this._musicService.verifySongId(songId);
    await this.verifyPlaylistSongAccess(playlistId, owner);
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async verifyPlaylistSongAccess(playlistId, userId) {
    try {
      await this._playlistService.verifyPlaylistsOwner(playlistId, userId);
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
