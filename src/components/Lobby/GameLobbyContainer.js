import { database } from '../../firebase';
import React, { useEffect, useState } from 'react';
import GameLobby from './GameLobby';
import GameCanceled from './GameCanceled';
import { setUserData } from '../../users';
import { 
  useGameData, 
  usePlayerRoster, 
  setRosterGameCodeToCancel, 
  setGameData, 
  useActiveUserGameRosterData, 
  addSelfToPlayerRoster
} from "../../helpers";

/**
 * Container that holds the logic, helpers, and state for the lobby.
 */
export default function GameLobbyContainer({ userData, authenticated }) {

  // Get game data with custom hook
  const gameData = useGameData(userData.currentGameCode);

  // Handles games canceled
  const [ gameCanceled, setGameCanceled ] = useState(false);
  useEffect(() => {
    const { currentGameCode } = userData
    currentGameCode === "cancelled" ? setGameCanceled(true) : setGameCanceled(false)
  }, [ userData ])

  useEffect(() => {
    addSelfToPlayerRoster(gameData, userData)
  })

  // Get player roster with custom hook
  const playerRoster = usePlayerRoster(gameData, userData);

  // Active user game-level data
  const activeUserGamePlayerData = useActiveUserGameRosterData(userData, playerRoster);

  /**
   * Used when the user cancels the game. Deletes the game and removes the game from the user data.
   * @param {String} gameCode 
   */
  function cancelGame(gameCode) {
    const gameRef = database.ref(`/games/${gameCode}`);

    // Sets each player's currentGameCode to "cancelled" (including host)
    // And removes the game from the database
    Promise.all([
      setRosterGameCodeToCancel(playerRoster),
      gameRef.remove()
    ])
    .catch(error => console.message(error.message));
  }

  /**
   * Manually removes the game code from the user object.
   */
  function leaveGame(gameCode) {
    // remove from User Data
    Promise.all([
      setUserData(userData.uid, "currentGameCode", null),
      database.ref(`/games/${gameCode}/playerRoster/${userData.uid}`).remove()
    ])
  }

  function removePlayer(removeUserUID) {
    Promise.all([
      setUserData(removeUserUID, "currentGameCode", "cancelled"),
      database.ref(`/games/${gameData.gameCode}/playerRoster/${removeUserUID}`).remove()
    ])
  }

  // Updates the player data on the game roster.
  // These updates are specific to the game only, 
  // they are not saved in the userData
  function updateGamePlayerRoster(uidToUpdate, newPlayerData) {
    const playerDirectory = `/playerRoster/${uidToUpdate}`;
    setGameData(gameData.gameCode, playerDirectory, newPlayerData);
  }

  // function instantiateGameOptions() {
  //   // THIS FUNCTION HAS SEVERAL PURPOSES
  //   // IT'S MAIN FUNCTION IS TO PROVIDE THE GAME OPTIONS AVAILABLE FOR THESE PLAYERS
  //   // IF THERE IS A GM CHANGE, THIS FUNCTION FIRES AGAIN AND RESETS EVERYTHING
  //   // THIS MEANS THIS FUNCTION SHOULD ONLY FIRE ONCE AT THE BEGINNING, AND AGAIN IF THERE IS A MAJOR CHANGE IN THE GAME REQUIRING A FRESH LOBBY
  //   // THIS FUNCTION SHOULD ALSO DYNAMICALLY MAKE OPTIONS AVAILABLE DEPENDING ON THE TYPE OF MEMBER THE HOST IS
  //   // IF THEY ARE A PAID MEMBER, THEY WILL HAVE OTHER GAME OPTIONS AVAILABLE
    
  //   // THIS IN ESSENCE, THIS SHOULD CONSTRUCT AN OBJECT THAT IS THEN SET TO THE GAME DATA, ONCE IT'S IN THE GAME DATA, THE COMPONENTS LISTENING TO THE GAME DATA WILL POPULATE AS EXPECTED SHOWING WHAT THEY SHOULD SHOW. ON A RESET, A NEW OBJECT IS JUST SET AT THIS LOCATION TO RESET EVERYTHING.
  // }

  if (gameCanceled) {
    return <GameCanceled leaveGame={leaveGame} userData={userData}/>
  } else if (gameData === null) {
    return <p>Loading...</p>
  } else {
    return (
    
      <GameLobby 
        component={GameLobbyContainer} 
        authenticated={authenticated} 
        gameData={gameData}
        cancelGame={cancelGame}
        userData={userData}
        leaveGame={leaveGame}
        playerRoster={playerRoster}
        updateGamePlayerRoster={updateGamePlayerRoster}
        removePlayer={removePlayer}
        isGM={activeUserGamePlayerData && activeUserGamePlayerData.isGM}
      />
    )
  }
}

