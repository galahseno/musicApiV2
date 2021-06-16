require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

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

const playlists = require('./api/playlist');
const PlaylistsService = require('./service/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

const playlistsong = require('./api/playlist/songs');
const PlaylistSongService = require('./service/postgres/PlaylistSongService');
const PlaylistsSongValidator = require('./validator/playlists/songs');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./service/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./service/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/uploads');
const StorageService = require('./service/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

const CacheService = require('./service/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const musicService = new SongService(cacheService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(cacheService);
  const collaborationsService = new CollaborationsService(cacheService);
  const playlistSongService = new
  PlaylistSongService(musicService, playlistsService, collaborationsService, cacheService);
  const producerService = new ProducerService(playlistSongService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/pictures'));

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
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('musicapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistsong,
      options: {
        service: playlistSongService,
        validator: PlaylistsSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: producerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
