const { validateError } = require('../../utils/index');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadPictureHandler = this.postUploadPictureHandler.bind(this);
  }

  async postUploadPictureHandler(request, h) {
    try {
      const { data } = request.payload;
      this._validator.validatePictureHeaders(data.hapi.headers);

      const filename = await this._service.writeFile(data, data.hapi);

      const response = h.response({
        status: 'success',
        data: {
          fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/pictures/${filename}`,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return validateError(error, h);
    }
  }
}

module.exports = UploadsHandler;
