import { database } from './firebase';
import { useState, useEffect } from 'react';
import { setUserData } from './users'

/**
 * Checks if a game exists.
 * @param {String} gameCode
 * @returns {Promise} Promise resulting in boolean
 */
export function gameExists(gameCode) {
  return database.ref(`games/${gameCode}`).once("value")
    .then(snapshot => snapshot.exists())
    .catch(error => console.log(error.message))
}

export function getGameStatus(gameCode) {
  return database.ref(`games/${gameCode}`).once("value")
    .then(snapshot => snapshot.val().gameStatus)
    .catch(error => console.log(error.message))
}

/**
 * Custom useState hook. 
 * Subscribes to game data and adds to state.
 * Checks validity of the game code before retrieving the game data.
 * Can handle null value as argument
 * Read only. Not used to update the game. It provides the game state, which is read from the database.
 * To modify the gameData, make changes to the database, this updates automatically.
 * @param {String} gameCodeValue Game code to check and retrieve
 * @returns Game Data (subscribed) | null (game not found)
 */
export function useGameData(gameCodeValue) {
  const [ gameData, setGameData ] = useState(null);
  const gameCode = gameCodeValue !== null && gameCodeValue.toUpperCase();

  useEffect(() => {

    async function fetchData() {
      try {
        // null gets it's own if statement to handle the event where game data is currently a game but needs to go to null.
        // this method causes gameCodeValue to dictate the value of gameCode, which is how this function should behave.
        if (gameCodeValue === null) {
          setGameData(null)
        } else if (gameCode !== "" && await gameExists(gameCode)) {
          const gameRef = database.ref(`games/${gameCode}`);
  
          const onGameValueChange = (snapshot) => {
            const gameData = snapshot.val();
            setGameData(gameData)
          }
      
          gameRef.on('value', onGameValueChange);
          
          return () => gameRef.off('value', onGameValueChange);  
        } else {
          setGameData(null)
        }
        
      } catch (error) {
        console.log(error.message)
      }
    }

  return fetchData();

  }, [ gameCodeValue, gameCode ])
  
  return gameData
}

export function pushGameData(gameCode, location, pushOn) {
  // return Promise.reject("problems yo") // for testing
  return database.ref(`games/${gameCode}/${location}`).push(pushOn);
}

export function updateGameData(gameCode, location, transactionTo) {
  // return Promise.reject("problems yo") // for testing
  return database.ref(`games/${gameCode}/${location}`).transaction(transactionTo);
}

export function setGameData(gameCode, location, transactionTo) {
  // return Promise.reject("problems yo") // for testing
  return database.ref(`games/${gameCode}/${location}`).set(transactionTo);
}

export function removePlayerFromPlayerRoster(uid) {
  // need to create this 
}

// Returns an array of promises, one promise for each player to edit
// this is the function that will be used when the host cancels the game
export function setRosterGameCodeToCancel(playerRoster) {
  
  // Creates an array of promises
  const requests = playerRoster.map(player => {
    return setUserData(player.uid, "currentGameCode", "cancelled")
  })

  // returns one promise
  return Promise.all(requests)
}

/********************************************************/
// CUSTOM HOOKS
/********************************************************/

/**
 * Watches the game data for updates to the game status. Fires respected callback when game status is updated. Safe if game data is null.
 * @param {Object} gameData From game data subscription
 * @param {Callback} lobbyCallback when status is 'lobby'
 * @param {Callback} liveCallback when status is 'live'
 * @param {Callback} endedCallback when status is 'ended'
 */
export function useGameStatusUpdate(gameData, lobbyCallback, liveCallback, endedCallback) {
  const [ gameStatus, setGameStatus ] = useState();

  // ISSUE
  // This fires when the game data goes from null to data. The problem with that is it's going to fire these callbacks the first time the game data is provided since that is a change to the game status state. If this function is going to be used, these callbacks should only fire when there is a status update, such as the game ending while being in the game or the game going live while in the lobby
  // This seems fixable with some sort of state gameDataLoaded that gets changed when the game data come in and prevents the first fire of this effect.
  // need to add a status for canceled (this canceled is different than a lobby cancel, which destroys the game data)

  // When the game data updates, update the game status.
  useEffect(() => {
    if (gameData !== null) {
      setGameStatus(gameData.gameStatus)
    }
  }, [gameData])

  // By watching only the game status
  useEffect(() => {
    if (gameStatus !== null) {
      if (gameStatus === 'lobby') {
        lobbyCallback || alert("game is in lobby")
      } else if (gameStatus === 'live') {
        liveCallback || alert("game is now live")
      } else if (gameStatus === 'ended') {
        endedCallback || alert("game has ended")
      }
    } 
  }, [gameStatus, lobbyCallback, liveCallback, endedCallback]);
}

export function createPlayerRosterObject({gameHostUID, gameGmUID}, {uid, displayName}) {

  // The player data object that populates the playerRoster
  const playerData = {
    uid,
    gameDisplayName: displayName,
    isHost: gameHostUID === uid,
    isGM: gameGmUID === uid
  }

  return playerData;
}

export function addSelfToPlayerRoster(gameData, userData) {

  if (gameData !== null) {

    const { gameCode } = gameData;
    const { uid, currentGameCode } = userData;

    // Current playerRoster for this game; might be null
    const { playerRoster } = gameData;

    // Stores all the keys (player uid) in an arr for searching
    const keys = [];
    for (let key in playerRoster) {keys.push(key)}
  
    // if uid is not found in the list of player uid
    // then push the playerData into the gameData.playerRoster
    if (!keys.includes(uid) && currentGameCode !== "cancelled") {

      // The player data object that populates the playerRoster
      const playerData = createPlayerRosterObject(gameData, userData);

      database.ref(`games/${gameCode}/playerRoster`).child(uid).set(playerData)
    }
  }
}

/**
 * Responsible for updating the playerRoster reference of the Game Data.
 * @param {*} gameData 
 * @param {*} userData 
 * @returns {Array} Player list
 */
export function usePlayerRoster(gameData) {

  const [ playerRoster, setPlayerRoster ] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      if (gameData !== null) {

        // Current playerRoster for this game; might be null
        const { playerRoster } = gameData;
        
        // updates the playerRoster array using the new player roster from Game Data
        const newPlayerRoster = [];
        for (let key in playerRoster) {
          newPlayerRoster.push(playerRoster[key])
        }
        
        setPlayerRoster(newPlayerRoster)
      }
    }
    fetchData();
  }, 
  // gameData is used here because this useEffect needs to fire after it arrives. 
  [ gameData ])
  
  return playerRoster;
}


/**
 * Returns the active users data from the Game Player Roster.
 * This data is not apart of the User Data, but rather is only game-level.
 * @param {Array} playerRoster Player roster created by the usePlayerRoster custom Hook
 * @returns {Object}
 */
export function useActiveUserGameRosterData(userData, playerRoster) {

  // This is the game level roster data for the active user
  const [ activeUserGamePlayerData, setActiveUserGamePlayerData ] = useState();
  
  useEffect(() => {
    let player = playerRoster.find(player => player.uid === userData.uid);
    
    // Sets this active user into the state for use throughout the lobby.
    setActiveUserGamePlayerData(player);

  }, [ playerRoster, userData ]);

  return activeUserGamePlayerData

}

/**
 * A custom hook used to synchronize state across all game instances. 
 * It sets up a listener at the location provided in param, when that location updates the value will update.
 * A function is provided that can update that location. Once the update is successful, the new value is synced across all users.
 * A 'loading' boolean is also provided.
 * @param {String} location The location in the database for this synced state.
 * @returns syncedState - Synced state from the DB
 * @returns setToSyncState - Function to update DB location
 * @returns loading - Boolean
 */
export function useSyncState(location) {

  const [ syncedState, setSyncedState ] = useState();
  const [ loading, setLoading ] = useState(false);

  // Rather than using a setState function, a regular function is used to get the value for this state.
  // This is because we don't need the extra renders from using a stateful function. We only want the render when the new value arrives from the DB
  function setToSyncState(value) {
    setLoading(true)
    const ref = database.ref(`games/${location}`);

    value !== undefined && 
    ref.set(value)
      .then(() => setLoading(false))
      .catch(error => {
        console.log(error.message);
        setLoading(false);
      })
  }

  // Sets up the listener for this syncedState
  useEffect(() => {
    const ref = database.ref(`games/${location}`);
  
    try {
      
      // Call back used for on/off methods
      const onValueChange = (snapshot) => {
        const value = snapshot.val();
        setSyncedState(value)
      }
      
      ref.on('value', onValueChange);
      
      // cleanup
      return () => ref.off('value', onValueChange);  
      
    } catch (error) {
      console.log(error.message)
    }
  }, [])

  return [ syncedState, setToSyncState, loading ]
}