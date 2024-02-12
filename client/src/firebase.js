// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "estate-finder-d2dfb.firebaseapp.com",
  projectId: "estate-finder-d2dfb",
  storageBucket: "estate-finder-d2dfb.appspot.com",
  messagingSenderId: "387226146259",
  appId: "1:387226146259:web:7b9ff45d721dae29944b26"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);