import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "http://dummy"
});
