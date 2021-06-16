const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class SongService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO apimusicv2 VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu Gagal ditambahkan');
    }

    await this._cacheService.delete(`songs:${id}`);
    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM apimusicv2');
    return result.rows.map(mapDBToModel);
  }

  async getSongById(id) {
    try {
      const result = await this._cacheService.get(`songs:${id}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM apimusicv2 WHERE id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }
      const resultMap = result.rows.map(mapDBToModel)[0];

      await this._cacheService.set(`songs:${id}`, JSON.stringify(resultMap));
      return resultMap;
    }
  }

  async editSongById(id, {
    title, year, performer, genre, duration,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE apimusicv2 SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete(`songs:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM apimusicv2 WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`songs:${id}`);
  }

  async verifySongId(songId) {
    const query = {
      text: 'SELECT * FROM apimusicv2 WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('songId tidak ditemukan');
    }
  }
}

module.exports = SongService;
