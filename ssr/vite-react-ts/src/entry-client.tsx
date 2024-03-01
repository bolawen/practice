import App from './App'
import { hydrateRoot } from 'react-dom/client';

const data = window.__SSR_DATA__;
const container = document.getElementById('root');
hydrateRoot(container!, <App data={data}/>);
