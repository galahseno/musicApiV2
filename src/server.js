require('dotenv').config();

const Hapi = require('@hapi/hapi');

const music = require('./api/music');
const SongService = require('./service/postgres/MusicService');
const SongValidator = require('./validator/music');

const users = require('./api/users');
const UsersService = require('./service/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/auth');
const AuthenticationsService = require('./service/postgres/AuthenticationsService');
const TokenManager = require('./token/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const init = async () => {
  const musicService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: music,
      options: {
        service: musicService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
