import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyDjdcJW78pn83g3wuvkI3HaqygYQJc1zDs",
  authDomain: "projeto-lista-todo.firebaseapp.com",
  projectId: "projeto-lista-todo",
  storageBucket: "projeto-lista-todo.firebasestorage.app",
  messagingSenderId: "1073040115437",
  appId: "1:1073040115437:web:a9862b7fd05930cf4ceee4"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
