import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';
import UpdatePlayerModal from "./UpdatePlayerModal";

function CancelButton({cancelGame, gameData}) {
  return (
   <Link to="/" className="mt-auto">
     <Button 
      variant="danger" 
      className="mb-3" 
      onClick={() => cancelGame(gameData.gameCode)}>Kill this game</Button>
   </Link>
 )
}

function LeaveButton({leaveGame, gameData}) {
  return (
   <Link to="/">
     <Button 
      variant="danger" 
      className="mb-3 w-100" 
      onClick={() => leaveGame(gameData.gameCode)}>
      Leave Game
      </Button>
   </Link>
 )
}

function CancelGameModal(
  {
    show,
    setCancelModalShow,
    cancelGame,
    gameData,
    onHide,
  }) {
  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => setCancelModalShow(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Cancel Game
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Are you sure?</h4>
        <p>You are about to cancel this game for all players.</p>
        <p>This cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex flex-row">
          <Button className="mb-3 mr-3" variant="primary" onClick={() => setCancelModalShow(false)}>Do not cancel!</Button>
          <CancelButton 
            cancelGame={cancelGame} 
            gameData={gameData}
            onClick={onHide}
          />
        </div>
      </Modal.Footer>
    </Modal>
  );
}

function PlayerLI(
  {
    children, 
    index, 
    setUpdatePlayerModalShow, 
    setEditingPlayer, 
    playerUID, 
    activeUserIsGM,
    isActiveUsersOwnName,
  }) {
  
  return (
    <ListGroup.Item key={index}>
      <div className="d-flex flex-row justify-content-center position-relative">
        <span>{children}</span>

        {/* Edit Player Button */}
        { (activeUserIsGM || isActiveUsersOwnName) && 
          <div className="d-flex mt-auto flex-row-reverse h-100 w-100 position-absolute align-items-center" >
            <div className="p-1" onClick={() => {
              setEditingPlayer(playerUID)
              setUpdatePlayerModalShow(true)
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fillRule="evenodd" d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm6 2a2 2 0 100-4 2 2 0 000 4z"></path></svg>
            </div>
          </div>
        }

      </div>
    </ListGroup.Item>
  )
}

export default function GameLobby({
  playerRoster, 
  gameData, 
  userData,
  leaveGame,
  cancelGame,
  updateGamePlayerRoster,
  isGM,
  removePlayer,
}) {
  
  const [ cancelModalShow, setCancelModalShow ] = useState(false);
  const [ editPlayerModalShow, setUpdatePlayerModalShow ] = useState(false);
  const [ editingPlayer, setEditingPlayer ] = useState(null);

  return (
    <>
      <h2 className="mb-3">Lobby</h2>
      <div className="d-flex flex-column h-100">
        
        <Card className="mt-3">
          <Card.Header className="text-center">Game Code</Card.Header>
          <Card.Body>
            <Card.Title className="text-center">{gameData.gameCode}</Card.Title>
          </Card.Body>
        </Card>

        <Card className="mt-3 mb-3">
          <Card.Header className="text-center">Players</Card.Header>
          <ListGroup variant="flush" className="text-center">
            {playerRoster.map((player, index) => {
                return (
                  <PlayerLI 
                    activeUserIsGM={isGM}
                    key={index} 
                    playerUID={player.uid}
                    setEditingPlayer={setEditingPlayer}
                    setUpdatePlayerModalShow={setUpdatePlayerModalShow}
                    index={index}
                    isActiveUsersOwnName={player.uid === userData.uid}
                    >
                    {player.gameDisplayName}
                  </PlayerLI>
                  )
              })}
          </ListGroup>
        </Card>

        {
          userData.uid === gameData.gameHostUID ? 
          <Button 
            className="mb-3 w-100" 
            variant="danger" 
            onClick={() => setCancelModalShow(true)}>
            Cancel Game
          </Button> 
            :
          <LeaveButton 
            leaveGame={leaveGame} 
            gameData={gameData} 
          />
        }

        <UpdatePlayerModal
          setUpdatePlayerModalShow={setUpdatePlayerModalShow}
          show={editPlayerModalShow}
          onHide={() => setUpdatePlayerModalShow(false)}
          playerRoster={playerRoster}
          setEditingPlayer={setEditingPlayer}
          updateGamePlayerRoster={updateGamePlayerRoster}
          editingPlayer={editingPlayer}
          removePlayer={removePlayer}
          isActiveUsersOwnName={editingPlayer === userData.uid}
          isGM={isGM}
        />

        <CancelGameModal
          setCancelModalShow={setCancelModalShow}
          show={cancelModalShow}
          onHide={() => setCancelModalShow(false)}
          cancelGame={cancelGame}
          gameData={gameData}
        />
      </div>
    </>
  )
}