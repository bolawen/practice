import React from "react";
import { uniq } from "lodash";
import { helloUtils } from "utils";
import { helloComponents } from "components";

function App() {
  helloUtils();
  helloComponents();

  console.log("uniq([2,2,2,3,3,3])", uniq([2,2,2,3,3,3]))

  return (
    <div>
      <h1>App A</h1>
    </div>
  );
}

export default App;
