import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAgfaAxwZ3e6MO7fpclwOc3UqEDMHvKmF8",
  authDomain: "cricketdwh.firebaseapp.com",
  projectId: "cricketdwh",
  storageBucket: "cricketdwh.firebasestorage.app",
  messagingSenderId: "1722037253",
  appId: "1:1722037253:web:ce9dd43ba547fc4230186c",
  measurementId: "G-86LZ5J9L4L"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
