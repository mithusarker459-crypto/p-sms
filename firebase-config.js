// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4IfokUfuYP38iaVlOmIpAaejDuZvCn0Y",
    authDomain: "partho-a1dd2.firebaseapp.com",
    databaseURL: "https://partho-a1dd2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "partho-a1dd2",
    storageBucket: "partho-a1dd2.firebasestorage.app",
    messagingSenderId: "241132183117",
    appId: "1:241132183117:web:c21345eb4c52477bb9c604"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Realtime Database এক্সপোর্ট করা হলো
export const db = getDatabase(app);


