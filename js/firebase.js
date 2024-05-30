// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

export const app = initializeApp({
  apiKey: "AIzaSyAoyGXf8gkDZOwGk0t20n3buf3EolH71rw",
  authDomain: "beautypro-marketplace.firebaseapp.com",
  projectId: "beautypro-marketplace",
  storageBucket: "beautypro-marketplace.appspot.com",
  messagingSenderId: "862407422859",
  appId: "1:862407422859:web:102b3a784fbfd784a4b58e",
  measurementId: "G-4ESLB3TV9Z"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);