import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "image-generator-disco.firebaseapp.com",
  projectId: "image-generator-disco",
  storageBucket: "image-generator-disco.appspot.com",
  messagingSenderId: "516514223132",
  appId: "1:516514223132:web:4d4982c08b4c7cde483bd9",
  measurementId: "G-9DMFRQ9W2T",
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

export default database;
