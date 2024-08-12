import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const goToMicroAppList = () => {
    navigate("/micro-app-list");
  };

  return (
    <div>
      <h3>基座首页</h3>
      <div className="menu">
        <div className="menu-item">
          <button onClick={goToMicroAppList}>微应用列表页</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
