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
            const { url, fileEncSha256, mediaKey, fileLength } = msg.message.imageMessage;
            response = await getWhatsappMedia({ url, fileEncSha256, mediaKey, fileLength }, "WhatsApp Image Keys");
            msg.imageMessageBuffer = response;
          } else if (msg.message.audioMessage) {
            const { url, fileEncSha256, mediaKey, fileLength } = msg.message.audioMessage;
            response = await getWhatsappMedia({ url, fileEncSha256, mediaKey, fileLength }, "WhatsApp Audio Keys");
            msg.audioMessageBuffer = response;
          } else if (msg.message.documentMessage) {
            const { url, fileEncSha256, mediaKey, fileLength } = msg.message.documentMessage;
            response = await getWhatsappMedia({ url, fileEncSha256, mediaKey, fileLength }, "WhatsApp Document Keys");
            msg.documentMessageBuffer = response;
          } else {
            node.send(msg);
            return;
          }
          node.send(msg);

        } catch (err) {
          console.error("Encountered an error:", err);
          node.error(err.message, msg);
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
