// Functions for user management
// Methods based off using the Firebase User UID as the location where
// user data is stored. This method is best for quickly retrieving the data
// and keeping the user data secure for just that user to access.


import { database } from './firebase';

/**
 * Checks if the provided UID argument exists in the Firebase Database
 * @param {Firebase Database Service} database database service from Firebase 
 * @param {String} uid Firebase User UID
 * @returns Promise resolving in boolean
 */
export function userExists(uid) {
  return database.ref(`users/${uid}`).once("value")
    .then(snapshot => snapshot.exists()
  ).catch(error => console.log(error.message))
}

/**
 * Creates a new user record in the Firebase Realtime Database
 * @param {Firebase Database Service} database 
 * @param {String} uid Firebase User UID
 * @param {String} displayName 
 */
export function createUser(uid, displayName, ) {

  // Creates a new records at the location of the user Firebase Users UID
  const userRef = database.ref(`users/${uid}`);

  userRef.set({
    uid,
    displayName,
  }).catch(error => console.log(error.message))

  // for chaining
  return true;

}

/**
 * Retrieves a single snapshot of the user data using the Firebase User UID
 * @param {Firebase Database Service} database 
 * @param {String} uid 
 * @returns Promise resolving in user data objet
 */
export function getUserData(uid) {
  
  const userRef = database.ref(`users/${uid}`);

  return userRef.once("value")
  .then(function(snapshot) {
      return snapshot.val()
    })
  .catch(error => console.log(error.message));

}

export function setUserData(uid, location, setTo) {
  // return Promise.reject("problems yo") // for testing
  return database.ref(`users/${uid}/${location}`).set(setTo);
}