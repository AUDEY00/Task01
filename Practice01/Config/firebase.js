var firebaseConfig = {
    apiKey: "...",
    authDomain: "practice01-cc39f.firebaseapp.com",
    databaseURL: "https://practice01-cc39f-default-rtdb.firebaseio.com",
    projectId: "practice01-cc39f",
    storageBucket: "practice01-cc39f.firebasestorage.app",
    messagingSenderId: "326323949063",
    appId: "1:326323949063:web:63c575a3b0a16b1f7a24a2",
    measurementId: "G-27DYXZB14V"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var db = firebase.firestore();

console.log("Firebase initialized successfully.");
console.log(database);
console.log("firestore",db);