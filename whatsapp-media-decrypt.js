module.exports = function (RED) {

  function DecryptWAMedia(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.name = config.name;

    node.on('input', async function (msg) {
      if (!msg.payload || !msg.payload.message || !msg.payload.message.imageMessage) {
        node.send(msg);
        return;
      }

      const { getWhatsappImageMedia } = await import('./src/decryptWhatsappMedia.mjs');
      try {
        const response = await getWhatsappImageMedia(msg.payload.message.imageMessage);
        msg.payload.message.imageMessageBuffer = response;
        node.send(msg);

      } catch (err) {
        console.error("encountered an error:", err);
      }
    });


    node.on('close', function () {
    });
  }

  RED.nodes.registerType("decrypt-media", DecryptWAMedia);
}
