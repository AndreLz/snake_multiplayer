import firebase from 'firebase/app'
import 'firebase/database'

export const db = firebase
    .initializeApp({ databaseURL: 'https://snake-scoredb.firebaseio.com/' })
    .database()