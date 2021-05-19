import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { auth } from '../../firebase';
import { useLocation } from 'react-router-dom'



export default function MenuButton() {
  let location = useLocation();
    
  console.log(location)

  return (
    location.pathname !== "/login" && 
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/login" onClick={() => auth.signOut()}>Logout</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
