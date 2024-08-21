import "./MicroAppList.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import microApp, { EventCenterForMicroApp } from "@micro-zoe/micro-app";

const microApps = [
  {
    title: "Vue 子应用",
    name: "vite-vue-micro-app",
    url: "http://localhost:4008/",
  },
  {
    isReload: true,
    title: "React 子应用",
    name: "vite-react-micro-app",
    url: "http://localhost:4007/",
  },
];

function MicroAppList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activedTab, setActivedTab] = useState<string>("");
  const [tabs, setTabs] = useState<{ label: string; value: string }[]>([]);

  const normalizeMicroAppContainer = (name: string) => {
    return name + "__micro-app";
  };

  const renderMicroApp = (app: { url: string; name: string }) => {
    microApp.renderApp({
      url: app.url,
      destory: true,
      name: app.name,
      "disable-sandbox": true,
      container: `#${normalizeMicroAppContainer(app.name)}`,
    });
  };

  const handleActiveApp = async (name: string) => {
    const elName = normalizeMicroAppContainer(name);
    const el = document.getElementById(elName);

    if (!el) {
      return;
    }

    const allActiveApps = microApp.getActiveApps();
    const app = microApps.find((app) => app.name === name);
    const isHasAppOfTabs = tabs.find((tab) => tab.value === name);

    if (!app) {
      microApp.unmountAllApps();
      return;
    }

    if (isHasAppOfTabs && !app.isReload && allActiveApps.includes(name)) {
      return;
    }

    if (app.isReload) {
      await microApp.unmountApp(name);
      if (el) {
        el.innerHTML = "";
      }
    }

    renderMicroApp(app);
  };

  const handlePathChange = () => {
    const path = location.pathname.split("/").pop();
    const needActiveApp = microApps.find((app) => app.name === path);
    const isHasAppOfTabs = tabs.find((tab) => tab.value === path);

    if (needActiveApp) {
      if (!isHasAppOfTabs) {
        setTabs([
          ...tabs,
          {
            label: needActiveApp.title,
            value: needActiveApp.name,
          },
        ]);
      }

      setActivedTab(needActiveApp.name);
      return;
    }

    const defaultTab = microApps[0];
    setTabs([
      {
        label: defaultTab.title,
        value: defaultTab.name,
      },
    ]);
    handleActiveApp(defaultTab.name);
  };

  const onTabClick = (tab: { label: string; value: string }) => {
    navigate(`/micro-app-list/${tab.value}`);
  };

  const onMenuClick = (name: string) => {
    navigate(`/micro-app-list/${name}`);
  };

  const onMicroAppMounted = (data: {
    appName: string;
    evnetType: string;
    communicationName: string;
  }) => {
    const { appName, communicationName } = data;
    microApp.setData(communicationName, data);
    console.log(`onMicroAppMounted: ${appName}`);
  };

  const onMicroAppUnmounted = (data: {
    appName: string;
    evnetType: string;
    communicationName: string;
  }) => {
    const { appName } = data;
    console.log(`onMicroAppUnmounted: ${appName}`);
  };

  const commonAppDataListener = (data: {
    appName: string;
    evnetType: string;
    communicationName: string;
  }) => {
    const { evnetType } = data;

    if (evnetType === "onMicroAppMounted") {
      onMicroAppMounted(data);
    } else if (evnetType === "onMicroAppUnmounted") {
      onMicroAppUnmounted(data);
    }
  };

  useEffect(() => {
    (window as any).microEventCenterForCommonApp = new EventCenterForMicroApp(
      "commonApp"
    );
    microApp.addDataListener("commonApp", commonAppDataListener);
  }, []);

  useEffect(() => {
    handlePathChange();
  }, [location.pathname]);

  useEffect(() => {
    handleActiveApp(activedTab);
  }, [activedTab, tabs]);

  return (
    <div className="micro-app-list">
      <div className="menu">
        {microApps.map((app, index) => (
          <div className="menu-item" key={index}>
            <button onClick={() => onMenuClick(app.name)}>{app.title}</button>
          </div>
        ))}
      </div>
      <div className="content">
        <div className="tabs">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className={`tab ${
                activedTab === tab.value ? "tab__active" : "tab__inactive"
              }`}
              onClick={() => onTabClick(tab)}
            >
              <div className="tab-item">{tab.label}</div>
            </div>
          ))}
        </div>
        <div className="micro-view-list">
          {tabs.map((tab, index) => {
            const app = microApps.find((app) => app.name === tab.value);

            if (!app) {
              return null;
            }

            return (
              <div
                key={index}
                className={`micro-view-item ${
                  activedTab === app.name
                    ? "micro-view-item__active"
                    : "micro-view-item__inactive"
                }`}
                id={normalizeMicroAppContainer(app.name)}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MicroAppList;
