import React, { useEffect, useState } from 'react'
import { useGameData, gameExists } from '../../helpers'
import { setUserData } from '../../users'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Modal from 'react-bootstrap/Modal'
import { Link, useHistory } from 'react-router-dom'


export default function JoinGame(props) {

  let history = useHistory();
  
  const [ showModal, setShowModal ] = useState(false);
  const [ modalBody, setModalBody ] = useState("");
  const [ noGameError, setNoGameError ] = useState(false);
  const [ showJoinButton, setShowJoinButton ] = useState(false);
  const [ gameFound, setGameFound ] = useState(null);

  const [ value, setValue ] = useState("");
  const [ validated, setValidated ] = useState(false);
  const [ joiningGameCode, setJoiningGameCode ] = useState("");
  const gameData = useGameData(joiningGameCode);

  // Handles updating the state after the form was validated and a new value has been entered.
  useEffect(() => {
    if (value.length > 0) {
      setValidated(false);
    }
  }, [value]);

  // 
  useEffect(() => {
    if (gameFound === null || gameFound === true) {
      setNoGameError(false)
    } else if (gameFound === false) {
      setNoGameError(true)
    }
  }, [ gameFound ])

  //////////////////// Game Found ////////////////////

  useEffect(() => {
    if (gameData !== null) {
      setGameFound(true)
      if (gameData.gameStatus === 'lobby') {
        
        let bodyText = 
        `Game is currently in lobby. Join?`
        setShowJoinButton(true)
        handleShow(bodyText)

      } else if (gameData.gameStatus === 'live') {

        let bodyText = 
        `Game is already live.`
        setShowJoinButton(false)
        handleShow(bodyText)

      } else if (gameData.gameStatus === 'ended') {
        
        let bodyText = 
        `Game has ended.`
        setShowJoinButton(false)
        handleShow(bodyText)

      }
    }
  }, [gameData]);

  //////////////////// Modal ////////////////////

  const handleClose = () => {
    setShowModal(false);
    setShowJoinButton(false);
    setModalBody("");
    setJoiningGameCode("");
  };
  const handleShow = (bodyText) => {
    setShowModal(true)
    setModalBody(bodyText);
  };

  // On player join, after the game code has been added to the user, redirect them to the "/lobby"
  // The reason the redirecting is not automatic is because the automatic routing only happens at the "/" directory.
  // At player join, they are on "/join", there the routing is not automatic. 
  // If a player tries to go to "/join" after having a game code, they will need to pass through "/" first and be redirected accordingly.
  function handleJoin() {
    setUserData(props.userData.uid, "currentGameCode", joiningGameCode)
      .then(() => history.push("/lobby"));
  };

  //////////////////// Form ////////////////////
  
  function handleChange(e) {
    setValue(e.target.value.toUpperCase());
    setGameFound(null);
  }
  
  async function handleSubmit(e) {

    e.preventDefault();

    if (value.length === 0) {
      setValidated(true);
    } else {
      // checks the provided value for a game

      let code = value.toUpperCase();
      
      if (await gameExists(code)) {
        // triggers the game data custom hook
        setJoiningGameCode(code);
      } else {
        setGameFound(false)
      }
    }
  }

  
  return (
    <div className="d-flex flex-column justify-content-between flex-grow-1">
      <div className="flex-fill position-relative">
        {noGameError && <Alert className="position-absolute w-100" variant="danger">No game found.</Alert>}
      </div>
      <div className="d-flex flex-column flex-fill">
        <Form
            noValidate
            validated={validated}
            onSubmit={handleSubmit}>
          <Form.Group 
            controlId="joinGameCode"
          >
            <Form.Label>Ask the game host for the Game Code</Form.Label>
            <Form.Control 
              size="lg" 
              type="text" 
              placeholder="e.g. 'WQDS'"
              value={value}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Missing something?
            </Form.Control.Feedback>
          </Form.Group>
          <Button className="w-100" variant="primary" type="submit">
            Join
          </Button>
          <div className="d-flex flex-column-reverse mt-3">
            <Link to="/" className="justify-content-center w-100">
              <Button variant="link" className="w-100">Back</Button>
            </Link>        
          </div>
        </Form>

        <Modal
          show={showModal}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>Game Found</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalBody}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            {showJoinButton && 
            <Button 
            onClick={handleJoin}
            variant="primary">Join</Button>}
          </Modal.Footer>
        </Modal>
      </div>
      <div className="d-flex flex-column-reverse ">  
      </div>
    </div>
  )
}


