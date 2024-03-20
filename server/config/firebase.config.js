// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app")

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3n8b_R3Q9Nbhct6B5OmNFT2RUkqdbieQ",
  authDomain: "learning-materials-312aa.firebaseapp.com",
  projectId: "learning-materials-312aa",
  storageBucket: "learning-materials-312aa.appspot.com",
  messagingSenderId: "462629492545",
  appId: "1:462629492545:web:74ef26b4bfab75fe5073c0",
  measurementId: "G-VE063W1BBD"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

module.exports = app
