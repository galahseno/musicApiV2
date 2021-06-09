const ClientError = require('../exceptions/ClientError');

const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  inserted_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: inserted_at,
  updatedAt: inserted_at,
});

const validateError = (error, h) => {
  let response;
  if (error instanceof ClientError) {
    response = h.response({
      status: 'fail',
      message: error.message,
    });
    response.code(error.statusCode);
    return response;
  }

  response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
  response.code(500);
  return response;
};

module.exports = { mapDBToModel, validateError };
