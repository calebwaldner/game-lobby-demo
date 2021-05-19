import React, { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Tooltip from 'react-bootstrap/Tooltip';
import Overlay from 'react-bootstrap/Overlay';
import Modal from 'react-bootstrap/Modal';

export default function UpdatePlayerModal(
  {
    show, 
    editingPlayer, 
    setEditingPlayer, 
    setUpdatePlayerModalShow, 
    updateGamePlayerRoster, 
    playerRoster,
    removePlayer,
    isActiveUsersOwnName,
    isGM,
  }) {

  const deleteRef = useRef(null);
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);
  const [ deleteToolTipTimeout, setDeleteToolTipTimeout ] = useState(null)

  // Finds the player data out of the player list
  const thisPlayerData = playerRoster.find(({uid}) => uid === editingPlayer);

  // boolean, true if currently editing name
  const [ editingName, setEditingName ] = useState(false);

  const [ updatedPlayerData, setUpdatedPlayerData ] = useState(thisPlayerData);
  // Sets the updated players data default values as the current values of the player selected
  useEffect(() => setUpdatedPlayerData(thisPlayerData), [thisPlayerData]);

  function onCloseModal() {
    setEditingPlayer(null);
    setUpdatePlayerModalShow(false);
    setEditingName(false);
    setShowDeleteTooltip(false);
    clearTimeout(deleteToolTipTimeout);
  }

  function onNameChangeButton() {

    // if "save" is being clicked
    editingName && updateGamePlayerRoster(thisPlayerData.uid, updatedPlayerData);

    // toggle editing name state
    setEditingName(editingName ? false : true)
  }

  function onNameChange(e) {
    const value = e.target.value;
    setUpdatedPlayerData(prevState => { 
      return {...prevState, gameDisplayName: value }
    })
  }

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={onCloseModal}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Edit Player
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex justify-content-center flex-column">
        <h4 className="text-center" >
          {thisPlayerData !== undefined ? thisPlayerData.gameDisplayName : null}
        </h4>
        <InputGroup className="mb-3">
          
          <InputGroup.Prepend>
            <InputGroup.Text>Name</InputGroup.Text>
          </InputGroup.Prepend>

          <FormControl
            placeholder={thisPlayerData !== undefined ? thisPlayerData.gameDisplayName : null}
            defaultValue={thisPlayerData !== undefined ? thisPlayerData.gameDisplayName : null}
            disabled={!editingName}
            onChange={onNameChange}
          />

          <InputGroup.Append>
            <Button onClick={onNameChangeButton} 
            active={editingName}
            variant={editingName ? "success" : "secondary"}
            >
              {editingName ? "Save" : "Edit"}
            </Button>

          </InputGroup.Append>

        </InputGroup>
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex flex-row-reverse justify-content-between w-100">

          <Button
            variant="primary"
            onClick={onCloseModal}>
            Close
          </Button>

          {/* Remove players. Only the GM can do this, but not to himself.
          "show" is included in this group becasue it helps prevent the button from appearing when the component is in transition*/}
          {
            !isActiveUsersOwnName && 
            isGM && 
            show && 
            <>
            <Button
              variant="danger"
              ref={deleteRef}
              onClick={() => {
                  if (showDeleteTooltip) {
                    removePlayer(thisPlayerData.uid)
                    onCloseModal()
                  } else if (!showDeleteTooltip) {
                    setShowDeleteTooltip(!showDeleteTooltip)
                    setDeleteToolTipTimeout(setTimeout(function(){ setShowDeleteTooltip(false); }, 3000));
                  }
                }
              }
              > 
                { !showDeleteTooltip && 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user-x"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
                }
                {
                  showDeleteTooltip && <span>Yes</span>
                }
            </Button>
            <Overlay 
              target={deleteRef.current} 
              show={showDeleteTooltip} 
              placement="right">
              {(props) => (
                <Tooltip id="overlay-example" {...props}>
                  Delete this player?
                </Tooltip>
              )}
            </Overlay>
            </>
          }

        </div>
      </Modal.Footer>
    </Modal>
  );
}
