# NodeRed Whatsapp Media Decrypt module

project inspired by node-red-contrib-whatsapp-link, while imageMessage is received from the node, still would want to get the image for further processing.

This project is used to decrypt whatsapp encrypted media file "file.enc" download from url.

## To Use

put the image message in `msg.message.imageMessage`
as follow.

```json
{
  "url": "url of the file.enc file, <https://mmg.whatsapp.net/o1/...>",
  "mimetype": "image/jpeg",
  "fileLength": "1234567",
  "fileEncSha256": "hash of encrypted file in base64",
  "mediaKey": "decryption key"
}
```

If the object is straight coming from [node-red-contrib-whatsapp-link](https://github.com/raweee/node-red-contrib-whatsapp-link), it should all be available

Result is stored at `msg.imageMessageBuffer` as Buffer

If you chain it with [node-red-contrib-image-tools](https://github.com/Steve-Mcl/node-red-contrib-image-tools), you should be able to check the picture in `viewer` node.

## TODO

- to support more types of media, such as video type etc...

## References

Inspired by the following projects

- <https://github.com/ddz/whatsapp-media-decrypt>
- <https://github.com/raweee/node-red-contrib-whatsapp-link>
- <https://github.com/Steve-Mcl/node-red-contrib-image-tools>
- <https://github.com/futoin/util-js-hkdf>

## Support

If you like this project a lot, you can buy some food for my dogs in [Patreon](https://www.patreon.com/supportpiggy)
