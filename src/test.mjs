import 'dotenv/config';
import fs from 'fs';
import { decryptImageMedia } from './decryptWhatsappMedia.mjs';

async function writeToFile(data, filePath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(data);
    writeStream.end();

    writeStream.on('finish', () => {
      // console.log('Decrypted data has been written to', filePath);
      resolve();
    });

    writeStream.on('error', (err) => {
      console.error('Error writing decrypted data:', err);
      reject(err);
    });
  });
};

async function main() {
  const decryptedData = await decryptImageMedia(
    process.env.ENC_MEDIA_URL,
    Buffer.from(process.env.ENC_MEDIA_SHA256, 'base64'),
    process.env.MEDIA_KEY
  )
  await writeToFile(decryptedData, "./decrypted_file.jpeg");
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
