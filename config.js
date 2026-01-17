import dotenv from "dotenv";
import fastify from "fastify";
import SetupSockets from "./Sockets.js";
import cors from "@fastify/cors";
import multer from "fastify-multer";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "fastify-cookie";
import Home from "./Routs/home.js";
import UploadRout from "./Routs/Upload/upload.js";
import tagsRout from "./Routs/Tags/tagsRout.js";
import accessTokenRout from "./Routs/accessTokenRout.js";
import dbConnector from "./utils/db/dbConnector.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

dotenv.config({ quiet: true });
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD80VaskQQCE-m3vqcfsjlpVtgXUKKxnmk",
  authDomain: "vaporcine-a823d.firebaseapp.com",
  projectId: "vaporcine-a823d",
  storageBucket: "vaporcine-a823d.firebasestorage.app",
  messagingSenderId: "414366266750",
  appId: "1:414366266750:web:be6c143129f744e9b9ef2f",
  measurementId: "G-TNLYG1JS47",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const app = fastify({ logger: true });
await app.register(fastifyCookie);
await app.register(fastifyMultipart, {
  limits: {
    fileSize: 5000 * 1024 * 1024,
    files: 5,
    fields: 10,
    fieldSize: 1024 * 1024,
  },
});

await app.register(cors, {
  origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
  credentials: true,
});

const socket = SetupSockets(app);
await app.decorate("io", socket);

await app.register(Home);
await app.register(UploadRout);
await app.register(tagsRout);
await app.register(accessTokenRout);

export default app;
