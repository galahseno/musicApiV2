const amqp = require('amqplib');

class ProducerService {
  constructor(playlistSongService) {
    this._playlistSongService = playlistSongService;
  }

  async sendMessage(queue, message, playlistId) {
    await this._playlistSongService.verifyPlaylistSongAccess(playlistId, message.userId);

    const messageString = JSON.stringify(message);
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(messageString));

    setTimeout(() => {
      connection.close();
    }, 1000);
  }
}

module.exports = ProducerService;
