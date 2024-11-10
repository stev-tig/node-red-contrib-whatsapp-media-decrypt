import crypto from 'crypto';
import hkdf from 'futoin-hkdf';

async function downloadFileIntoBuffer(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

export const getWhatsappMedia = async function({ url, fileEncSha256, mediaKey, fileLength }, mediaType) {

  // Convert fileEncSha256 to Buffer if it's a base64 string
  let fileEncSha256Buffer = Buffer.isBuffer(fileEncSha256)
    ? fileEncSha256
    : Buffer.from(fileEncSha256, 'base64');

  const decryptedData = await decryptMedia(url, fileEncSha256Buffer, mediaKey, mediaType);

  // File length verification
  const decryptedDataLength = decryptedData.length;
  const expectedFileLength = typeof fileLength === 'string' ? parseInt(fileLength) : fileLength.low;

  if (expectedFileLength !== decryptedDataLength) {
    console.error("Decrypted file length does not match", expectedFileLength, decryptedDataLength);
    throw new Error("Decrypted file length does not match");
  }

  return decryptedData;
}

export const decryptMedia = async function(encFileURL, encFileHashExpected, mediaKey, mediaType) {
  const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');

  const hashLen = hkdf.hash_length('sha256');
  const prk = hkdf.extract('sha256', hashLen, mediaKeyBuffer, null);
  const mediaKeyExpanded = hkdf.expand('sha256', hashLen, prk, 112, mediaType);

  const iv = mediaKeyExpanded.subarray(0, 16);
  const cipherKey = mediaKeyExpanded.subarray(16, 48);

  const encFileData = await downloadFileIntoBuffer(encFileURL);
  const encHash = crypto.createHash('sha256').update(encFileData).digest();

  if (!encHash.equals(encFileHashExpected)) {
    throw new Error("Encrypted file hash does not match");
  }

  const fileData = encFileData.subarray(0, encFileData.length - 10);

  const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
  let decryptedData = Buffer.concat([decipher.update(fileData), decipher.final()]);

  return decryptedData;
}
