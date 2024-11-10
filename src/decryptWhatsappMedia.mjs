import crypto from 'crypto';
import hkdf from 'futoin-hkdf';

async function downloadFileIntoBuffer(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

export const getWhatsappMedia = async function(mediaMessage, mediaType) {
  const { url, fileEncSha256, mediaKey, fileLength } = mediaMessage;

  let fileEncSha256Buffer = Buffer.from(fileEncSha256, 'base64');

  const decryptedData = await decryptMedia(url, fileEncSha256Buffer, mediaKey, mediaType);

  if (typeof fileLength === 'string') {
    if (fileLength !== decryptedData.length.toString()) {
      console.error("Decrypted file length does not match", fileLength, decryptedData.length);
      return null;
    }
  } else {
    if (fileLength.low !== decryptedData.length) {
      console.error("Decrypted file length does not match", fileLength, decryptedData.length);
      return null;
    }
  }

  return decryptedData;
}

export const decryptMedia = async function(encFileURL, encFileHashExpected, mediaKey, mediaType) {
  const mediaKeyBlob = Buffer.from(mediaKey, 'base64');

  const hash_len = hkdf.hash_length('sha256');
  const prk = hkdf.extract('sha256', hash_len, mediaKeyBlob, null);
  const mediaKeyExpanded = hkdf.expand('sha256', hash_len, prk, 112, mediaType);

  let iv = mediaKeyExpanded.subarray(0, 16);
  let cipherKey = mediaKeyExpanded.subarray(16, 48);

  const encFileData = await downloadFileIntoBuffer(encFileURL);
  const encHash = crypto.createHash('sha256').update(encFileData).digest();
  if (encHash.toString('base64') !== encFileHashExpected.toString('base64')) {
    throw new Error("Encrypted file hash does not match");
  }

  let fileLen = encFileData.length - 10;
  let file = encFileData.subarray(0, fileLen);

  const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
  let decryptedData = decipher.update(file);
  decryptedData = Buffer.concat([decryptedData, decipher.final()]);

  return decryptedData;
}
