module.exports = function (RED) {

  function DecryptWAMedia(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.name = config.name;

    node.on('input', async function (msg) {
      if (msg.message) {
        const { getWhatsappMedia } = await import('./src/decryptWhatsappMedia.mjs');
        let response;
        try {
          if (msg.message.imageMessage) {
            response = await getWhatsappMedia(msg.message.imageMessage, "WhatsApp Image Keys");
            msg.imageMessageBuffer = response;
          } else if (msg.message.audioMessage) {
            response = await getWhatsappMedia(msg.message.audioMessage, "WhatsApp Audio Keys");
            msg.audioMessageBuffer = response;
          } else if (msg.message.documentMessage) {
            response = await getWhatsappMedia(msg.message.documentMessage, "WhatsApp Document Keys");
            msg.documentMessageBuffer = response;
          } else {
            node.send(msg);
            return;
          }
          node.send(msg);

        } catch (err) {
          console.error("Encountered an error:", err);
          return;
        }
      } else {
        node.send(msg);
        return;
      }
    });

    node.on('close', function () {});
  }

  RED.nodes.registerType("decrypt-media", DecryptWAMedia);
}
