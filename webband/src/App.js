import React, { useState } from "react";
import Login from "./Login";
import DAW from "./DAW";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? <DAW /> : <Login onLogin={() => setLoggedIn(true)} />;
}
