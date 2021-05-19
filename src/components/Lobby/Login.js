import React, { useRef } from 'react';
import { auth } from '../../firebase';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function Login({handleCustomDisplayName}) {

  const formRef = useRef(null);

  const anonymousSignIn = (e) => {
    e.preventDefault();
    auth.signInAnonymously()
    .then(() => {
      // Signed in..
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });
  }

  return (
    <>
      <Card>
        <Card.Body className="d-flex flex-column justify-content-center">
          <h2 className="text-center mb-3">Welcome to the Game Lobby Demo!</h2>
          <Form inline className="d-flex justify-content-center mt-4">
            <Form.Group controlId="name" >
              <Form.Control 
                type="text" 
                placeholder="Name" 
                onChange={(e) => handleCustomDisplayName(e)}
                ref={formRef}
                required
              />
            </Form.Group>
            <Button 
              className="ml-2" 
              variant="primary"
              onClick={anonymousSignIn}
              type="submit"
              disabled={formRef.current === null || formRef.current.value === ""}
            >
              Log In
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
      </div>
    </>
  )
}
