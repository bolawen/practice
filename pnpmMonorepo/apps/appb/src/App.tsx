import React from "react";
import { helloUtils } from "utils";
import { helloComponents } from "components";

function App() {
  helloUtils();
  helloComponents();

  return (
    <div>
      <h1>App A</h1>
    </div>
  );
}

export default App;
