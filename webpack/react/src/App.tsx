import "@/App.scss";
import "@/App.less";
import styleModuleCss from "@/App.module.css";
import styleModuleScss from "@/App.module.scss";
import styleModuleLess from "@/App.module.less";


function App() {
  return (
    <div className="app">
      App 页面
      <div className="a"></div>
      <div className="d"></div>
      <div className={styleModuleCss.e}></div>
      <div className={styleModuleScss.b}></div>
      <div className={styleModuleLess.c}></div>
    </div>
  );
}

export default App;
