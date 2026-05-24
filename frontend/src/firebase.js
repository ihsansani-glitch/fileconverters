import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBIREP-hYuZbAabofj7zPWz89-GbqaoOYE",
  authDomain: "ilovetools-2d05f.firebaseapp.com",
  projectId: "ilovetools-2d05f",
  storageBucket: "ilovetools-2d05f.firebasestorage.app",
  messagingSenderId: "731407390732",
  appId: "1:731407390732:web:5aa00b41a15b403b22b629"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()