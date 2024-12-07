import "./App.scss";
import "./App.less";
import appStyleLess from "./App.module.less";
import appStyleScss from "./App.module.scss";

function App() {
  const a = 1;
  const b = () => {
    return 2;
  };

  return (
    <div className="app">
      嘻嘻哈哈
      <div className={appStyleLess.boxLess}></div>
      <div className={appStyleScss.boxScss}></div>
    </div>
  );
}

export default App;
