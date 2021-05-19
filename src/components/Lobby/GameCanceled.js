import { setUserData } from "../../users";
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function GameCanceled(props) {
  return (
    <>
      <h2 className="mb-3">Lobby</h2>
      <div className={"d-flex flex-column flex-fill"}>
        <h4>Game Canceled!</h4>
        <Link to="/">
          <Button onClick={() => setUserData(props.userData.uid, "currentGameCode", null)} variant="primary" className="mb-3 w-100">Go Back</Button>
        </Link>
      </div>
    </>
  )
}
