import firebase from 'firebase/app';
import 'firebase/database'
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAwlETKCyCtlCbLYtdeNECI2FkTxOV1B5k",
  authDomain: "game-lobby-demo.firebaseapp.com",
  databaseURL: "https://game-lobby-demo-default-rtdb.firebaseio.com",
  projectId: "game-lobby-demo",
  storageBucket: "game-lobby-demo.appspot.com",
  messagingSenderId: "32986840617",
  appId: "1:32986840617:web:7c0c28a5c317e1557ba638",
  measurementId: "G-BZNE3B93L4"
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
export const auth = firebaseApp.auth();

// Firebase app instance
export default firebaseApp;

function emulatorConnect() {
  // Point to the emulator running on localhost.
  database.useEmulator("localhost", 9000);

  auth.useEmulator("http://localhost:9099")
}

// A reference to the database service
export const database = firebase.database();
if (window.location.hostname === "localhost") {
  emulatorConnect();
} 
