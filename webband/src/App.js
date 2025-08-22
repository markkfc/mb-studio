import React, { useState } from "react";
import LoginPage from "./LoginPage";
import DAW from "./DAW";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      {!loggedIn ? (
        <LoginPage onLogin={() => setLoggedIn(true)} />
      ) : (
        <DAW />
      )}
    </div>
  );
}

export default App;
