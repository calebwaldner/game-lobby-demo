import { database } from '../../firebase';
import React, { useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import { setUserData } from "../../users";
import Button from "react-bootstrap/Button";
import { Spinner } from 'react-bootstrap';


export default function StartScreen(props) {

  const history = useHistory();

  // when the user has a currentGameCode, redirect them to the lobby
  useEffect(() => {
    if (props.userData !== null
      && props.userData.hasOwnProperty("currentGameCode")) {
      history.replace("./lobby")
    }
  }, [props.userData, history])

  /**
   * Creates a game key depending on the length and characters variables.
   * @returns string containing game key
   */
  function makeGameCode() {
    let length = 4;
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
    let result = '';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Responsible for instantiating a new game object, storing that object in the DB, and saving the game code to the User Data.
   */
  function createGame() {

    try {
      const gameCode = makeGameCode();
          
      // Create a new game at with the game code as part of the path to the DB reference
      // This makes it easier to listen to this reference
      const gamesRef = database.ref(`games/${gameCode}`);
          
      // Populate game object
      const game = {
        gameCode: gameCode,
        gameHostDisplayName: props.userData.displayName,
        gameHostUID: props.userData.uid,
        gameGmUID: props.userData.uid,
        gameCreateTimestamp: Date.now(),
        gameStatus: "lobby"
      }
          
      // Set the game in the database. Upon success set in userData
      // Adding game code to userData triggers the redirect to the lobby
      gamesRef.set(game)
        .then(() => setUserData(props.userData.uid, "currentGameCode", gameCode))
        .catch(error => console.log(error.message));

    } catch (error) {
      console.log(error.message)
    }
    
  }

  return (
    <>
      <div className="align-items-center">

        <div className="user-info mb-5">
          {props.userData ? <h2>Hi, {props.userData.displayName}</h2> : <Spinner animation="border"></Spinner>}
        </div>
        <Button onClick={createGame} variant="primary" size="lg" className="mb-3 w-100">Create Game</Button>
        {' '}
        <Link to="/join">
          <Button variant="secondary" size="lg" className="w-100">
            Join Game
          </Button>
        </Link>
      </div>
    </>
  )
  
}