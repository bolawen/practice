import App from './App.tsx'
import ReactDOM from 'react-dom/client'

declare global {
  interface Window {
    microApp: any
    __MICRO_APP_NAME__: string
    __MICRO_APP_ENVIRONMENT__: string
    __MICRO_APP_BASE_ROUTE__: string
  }
}

// 与基座的数据交互
function handleMicroData () {
  // 是否是微前端环境
  if (window.__MICRO_APP_ENVIRONMENT__) {
    // 主动获取基座下发的数据
    console.log('child-react17 getData:', window.microApp.getData());

    // 监听基座下发的数据变化
    window.microApp.addDataListener((data: Record<string, unknown>) => {
      console.log('child-react17 addDataListener:', data);
    })

    // 向基座发送数据
    setTimeout(() => {
      window.microApp.dispatch({ myname: 'child-react17' });
    }, 3000)
  }
}

function mount () {
  ReactDOM.createRoot(document.getElementById('vite-react-micro-app')!).render(
    <App />
  )
  handleMicroData()
}

// 将卸载操作放入 unmount 函数
function unmount () {
  ReactDOM.unmountComponentAtNode(document.getElementById('react17-root')!);
  console.log('微应用child-react17卸载了');
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_ENVIRONMENT__) {
  window[`micro-app-${window.__MICRO_APP_NAME__}`] = { mount, unmount }
} else {
  // 非微前端环境直接渲染
  mount();
}


