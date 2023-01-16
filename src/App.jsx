import { useEffect, useState } from "react";
import "./add.css";
import { useNavigate } from "react-router";

function App() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    console.log(value);
  }, [value]);
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>
        To join a meeting, kindly paste the meeting's ID in the form below and
        click on join
      </h3>
      <h5>
        To create a meeting click on create and use the share button to copy id
        and share
      </h5>
      <input
        autoFocus={false}
        name="roomID"
        value={value}
        onInput={(e) => setValue(e.target.value)}
        type="text"
        placeholder="Paste in your meeting ID"
      />
      <div className="buttons">
        <button
          type="submit"
          onClick={() => {
            if (value.length != 20) return;
            navigate(`/call/${value}`);
          }}
        >
          Join
        </button>
        <button
          className="create"
          onClick={() => {
            navigate(`/call/create`);
          }}
        >
          Create
        </button>
      </div>
    </form>
  );
}

export default App;
