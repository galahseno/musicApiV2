const Joi = require('joi');

const PlaylistsSongsPayloadSchema = Joi.object({
  songId: Joi.string().min(16).required(),
});

module.exports = { PlaylistsSongsPayloadSchema };
