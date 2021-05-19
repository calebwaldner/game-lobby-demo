import React from 'react';
import { Route, Redirect } from 'react-router-dom'

// https://codesource.io/authenticating-react-app-with-firebase/
// It receives 3 props: the component to render if the condition is true, the authenticated state and we use the ES6 spread operator to get the remaining parameters passed from the router.
// It checks if authenticated is true and renders the component passed, else it redirects to/login.
export function PrivateRoute({ component: Component, authenticated, ...rest }) {

  return (
    <Route 
      {...rest}
      render={props => {
        // {...props} are the props from the Route: match, location, history
        // {...rest} are the props that are passed in from the HOC PrivateRoute
        return authenticated ? <Component {...props} {...rest} /> : <Redirect to='/login' />
      }}
    />
  )

}

// More info, see https://medium.com/@thanhbinh.tran93/private-route-public-route-and-restricted-route-with-react-router-d50b27c15f5e
export function PublicRoute({ component: Component, restricted, authenticated, ...rest }) {

  return (
    // restricted = false meaning public route
    // restricted = true meaning restricted route
    <Route 
      {...rest}
      render={props => {
        // {...props} are the props from the Route: match, location, history
        // {...rest} are the props that are passed in from the HOC PrivateRoute
        return (restricted && authenticated) ? <Redirect to="/" /> : <Component {...props} {...rest} /> 
        
      }}
    />
  )

}

