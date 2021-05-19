import { auth, database } from '../firebase.js';
import { createUser, userExists } from '../users';
import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from "./CustomRoutes";
import StartScreen from './Lobby/StartScreen.js';
import Login from './Lobby/Login.js';
import MenuButton from './Lobby/MenuButton.js';
import GameLobbyContainer from './Lobby/GameLobbyContainer.js';
import JoinGame from './Lobby/JoinGame.js';


class App extends Component {

  constructor() {
    super();
    this.wrapper = React.createRef();
    this.state = {
      loading: true,
      authenticated: false,
      userData: null,
      userLoginData: null,
      gameData: null,
      customDisplayName: null,
    }
  }

  componentDidMount() {
    this.userSignIn()
  }

  componentWillUnmount() {
    return this.userSignIn()
  }

  /**
   * Responsible for checking if user is logged in via Firebase.
   * Sets state accordingly 
   */
  userSignIn = () => {
    
    // onAuthStateChange is a listener that provides the current user.
    // This is Googles recommended method to get the current user
    return auth.onAuthStateChanged((user) => {
      
      // if the user is signed in, set App state
      if (user) {

        this.setState(() => {
          return {
            authenticated: true,
            loading: false,
            userData: null, // set in this functions callback
            
            // used when creating a new user account. otherwise the user object holds the user data used in the app
            userLoginData: { 
              displayName: user.displayName,
              uid: user.uid
            },  
          }
          
        }, 
        // User Data setState callback used here in order to use promise in initial setState working between setState, firebase auth, and promises, this seems to be the best way to resolve this task.
        this.retrieveUserData
        );

      } else {
        // if no user is logged in, reset state
        this.setState(() => ({
          authenticated: false,
          loading: false,
          userData: null,
          userLoginData: null
        }));
      }
    })
  }

/**
 * Listens to the user data on the Firebase Database and syncs the app state. Can be turned on or off.
 * @param {String} uid Firebase User UID
 * @param {boolean} turnOn Turn on or off the listener
 */
  listenToUser = (uid, turnOn = true) => {
    const userRef = database.ref(`users/${uid}`);

    // callback used in the listener functions
    const onUserDataValueChange = (snapshot) => {
      const userData = snapshot.val();
      this.setState({
        userData: userData
      })
    }

    // if turnOn, add "value" listener. Otherwise remove listener.
    if (turnOn) {
      userRef.on('value', onUserDataValueChange);
    } else {
      userRef.off('value', onUserDataValueChange);
    }
  }

  /**
   * Call back function used to handle retrieving and creating new user data.
   * Also responsible for establishing event listener on userData. 
   */
  async retrieveUserData() {
    let userUID = this.state.userLoginData.uid;

    try {
      if (await userExists(userUID)) {

        this.listenToUser(userUID)

      } else {
        // if user data does not exits

        // Creates the user data using default values gathered from the user login data provided
        let userCreated = createUser(
            userUID, 
            this.state.customDisplayName, 
        )
        // if the user was created, listen to the user data
        // else throw an error saying there was a problem creating the user account
        if (userCreated) {
          
          this.listenToUser(userUID)

        } else {
          throw new Error("There was a problem creating a user account.")
        }
      }
    } catch (error) {
      // if there was an error from the getUserData process
      console.log(error.message)
    }
  }

  // Updates the users custom name to App component state
  handleCustomDisplayName = (e) => {
    this.setState(() => {return {customDisplayName: e.target.value}})
  }

  render() {
    let {
      authenticated, 
      userData,
    } = this.state;

    return (
      <div className='app d-flex flex-column h-100'>
  
        <header className="sticky-top bg-dark text-white d-flex justify-content-center" style={{"minHeight": "56px"}}>
          <div className="menu mr-auto">
            <MenuButton />
          </div>
          <div className="d-flex justify-content-center position-absolute">
            <h1>Game Lobby</h1>
          </div>
        </header>

        <div 
          className='container-sm d-flex flex-grow-1 flex-column justify-content-center p-3 w-75'
        >
          <Switch>

            <PrivateRoute exact path='/'
              component={StartScreen} 
              authenticated={authenticated}
              userData={userData}
            />

            <PublicRoute 
              path='/login'
              component={Login}
              authenticated={authenticated}
              restricted={true}
              handleCustomDisplayName={this.handleCustomDisplayName}
            />

            <PrivateRoute exact path='/lobby'
              component={GameLobbyContainer} 
              authenticated={authenticated}
              userData={userData}
            />

            <PrivateRoute exact path='/join'
              component={JoinGame}
              authenticated={authenticated} 
              userData={userData}
            />
          
          </Switch>

        </div>

      </div>
    );
  }
}
export default App;