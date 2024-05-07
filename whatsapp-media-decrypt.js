module.exports = function (RED) {

  function DecryptWAMedia(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.name = config.name;

    node.on('input', async function (msg) {
      if (!(msg.message && msg.message.imageMessage)) {
        node.send(msg);
        return;
      }

      const { getWhatsappImageMedia } = await import('./src/decryptWhatsappMedia.mjs');
      try {
        const response = await getWhatsappImageMedia(msg.message.imageMessage);
        msg.imageMessageBuffer = response;
        node.send(msg);

      } catch (err) {
        console.error("encountered an error:", err);
        return;
      }
    });


    node.on('close', function () {
    });
  }

  RED.nodes.registerType("decrypt-media", DecryptWAMedia);
}
