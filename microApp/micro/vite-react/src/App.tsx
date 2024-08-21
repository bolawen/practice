import { useEffect } from "react";

function App() {
  useEffect(() => {
    if (!(window as any).microEventCenterForCommonApp) {
      return;
    }

    (window as any).microEventCenterForCommonApp.dispatch({
      evnetType: "onMicroAppMounted",
      appName: (window as any).__MICRO_APP_NAME__ || "vite-react-micro-app",
      communicationName: (window as any).microEventCenterForCommonApp.appName,
    });

    (window as any).microEventCenterForCommonApp.addDataListener(
      (data: any) => {
        console.log(data);
      }
    );

    return () => {
      (window as any).microEventCenterForCommonApp.dispatch({
        evnetType: "onMicroAppUnmounted",
        appName: (window as any).__MICRO_APP_NAME__ || "vite-react-micro-app",
        communicationName: (window as any).microEventCenterForCommonApp.appName,
      });
    };
  }, []);

  return (
    <div className="vite-vue-micro-app">
      <h1>Vite React Micro App 子应用</h1>
    </div>
  );
}

export default App;
