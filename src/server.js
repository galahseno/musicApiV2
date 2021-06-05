require('dotenv').config();

const Hapi = require('@hapi/hapi');
const music = require('./api/music');
const SongService = require('./service/postgres/MusicService');
const SongValidator = require('./validator/music');

const init = async () => {
  const musicService = new SongService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: music,
    options: {
      service: musicService,
      validator: SongValidator,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
