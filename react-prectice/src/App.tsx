import React, { Suspense } from "react";

const VirtualList = React.lazy(
  () => import("./component/VirtualList/virtualList")
);

function App() {
  return (
    <div>
      <Suspense fallback={<></>}>
        <VirtualList />
      </Suspense>
    </div>
  );
}

export default App;
