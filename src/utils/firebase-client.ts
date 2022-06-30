// Import the functions you need from the SDKs you need
import {getMessaging} from "@firebase/messaging";
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore} from "@firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries
if (!getApps().length) {
  initializeApp({
    apiKey: 'AIzaSyAAUdlbkSgcq1wQfkskEI45XkU36hSp_Mc',
    authDomain: 'cpvlc-c286e.firebaseapp.com',
    projectId: 'cpvlc-c286e',
    storageBucket: 'cpvlc-c286e.appspot.com',
    messagingSenderId: '710927676711',
    appId: '1:710927676711:web:bb9970311a519b918d2502'
  })
}

export default getApps()[0]