// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCw4Yx_1Q2PqHA-Y_Fa40JbXjh27X8SBz4",
  authDomain: "safe-connect-3b60b.firebaseapp.com",
  databaseURL: "https://safe-connect-3b60b-default-rtdb.firebaseio.com",
  projectId: "safe-connect-3b60b",
  storageBucket: "safe-connect-3b60b.firebasestorage.app",
  messagingSenderId: "748525312057",
  appId: "1:748525312057:web:3e6e39e8bbb424027a55e8",
  measurementId: "G-5S5QV8CLW1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

export { auth, provider, database };
