import crypto from 'crypto';
import hkdf from 'futoin-hkdf';

async function downloadFileIntoBuffer(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

export const getWhatsappImageMedia = async function(imageMessage) {
  if (imageMessage.mimetype !== 'image/jpeg') {
    return null;
  }

  let fileEncSha256 = Buffer.from(imageMessage.fileEncSha256);
  if (typeof imageMessage.fileEncSha256 === 'string') {
    fileEncSha256 = Buffer.from(imageMessage.fileEncSha256, 'base64');
  }
  const decryptedData = await decryptImageMedia(imageMessage.url, fileEncSha256, imageMessage.mediaKey);

  if (typeof imageMessage.fileLength === 'string') {
    if (imageMessage.fileLength !== decryptedData.length.toString()) {
      console.error("Decrypted file length does not match", imageMessage.fileLength, decryptedData.length);
      return null;
    }
  } else {
    // the format from whatsapp link being Long { low: val, high: val, unsigned: bool }
    // don't want to handle a customized format for now
    if (imageMessage.fileLength.low !== decryptedData.length) {
      console.error("Decrypted file length does not match", imageMessage.fileLength, decryptedData.length);
      return null;
    }  
  }
  
  return decryptedData;
}

export const decryptImageMedia = async function(encFileURL, encFileHashExpected, mediaKey) {
  const mediaKeyBlob = Buffer.from(mediaKey, 'base64');

  const hash_len = hkdf.hash_length('sha256');
  const prk = hkdf.extract('sha256', hash_len, mediaKeyBlob, null);
  const mediaKeyExpanded = hkdf.expand('sha256', hash_len, prk, 112, "WhatsApp Image Keys");


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