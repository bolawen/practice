import React, {useState} from 'react';
import logo from '@/assets/svg/logo.svg';
import Select, {Option} from 'rc-select';

function App() {
    const [title, setTitle] = useState<string>('Vite-React 模板');
    const name: string = 'st';
    const age: number = 200;
    return (
        <div>
            <Select>
                <Option value="jack">jack</Option>
                <Option value="lucy">lucy</Option>
                <Option value="yiminghe">yiminghe</Option>
            </Select>
        </div>
    );
}

export default App;
