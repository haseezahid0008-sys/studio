// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpKLhf0scc4y68QqEAUe59tkQuRvehGMA",
  authDomain: "js-glow-757f3.firebaseapp.com",
  projectId: "js-glow-757f3",
  storageBucket: "js-glow-757f3.appspot.com",
  messagingSenderId: "663931171871",
  appId: "1:663931171871:web:7211172fbea13f8e95912a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
