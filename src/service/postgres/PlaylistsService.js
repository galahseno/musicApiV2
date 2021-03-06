const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylists({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlists Gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(id) {
    let resultPlaylist;
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = $1`,
      values: [id],
    };
    resultPlaylist = await this._pool.query(query);
    if (!resultPlaylist.rowCount) {
      const queryColab = {
        text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        INNER JOIN users ON playlists.owner = users.id
        INNER JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE collaborations.user_id = $1`,
        values: [id],
      };
      resultPlaylist = await this._pool.query(queryColab);
    }
    return resultPlaylist.rows;
  }

  async deletePlaylistsById(id, owner) {
    await this.verifyPlaylistsOwner(id, owner);
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistsOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
