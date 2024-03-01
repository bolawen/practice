import App from './App.tsx'
import ReactDOM from 'react-dom/client'
import microApp from '@micro-zoe/micro-app'

microApp.start({
  plugins: {
    modules: {
      'vite-react-micro-app': [
        {
          loader(code) {
            if (process.env.NODE_ENV === 'development') {
              code = code.replace(/(from|import)(\s*['"])(\/child\/vite\/)/g, all => {
                return all.replace('/micro-app-list/', 'http://localhost:5173/micro-app-list/')
              })
            }

            return code
          }
        }
      ],
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
