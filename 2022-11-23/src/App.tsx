import React, {useState} from 'react';
import logo from '@/assets/svg/logo.svg';

interface ChildPropsType {
    setTitle: (value: string) => void;
}

function Child(props: ChildPropsType) {
    const {setTitle} = props;

    return <div>Child</div>;
}

function App() {
    const [title, setTitle] = useState<string>('Vite-React 模板');
    return (
        <div>
            App
            <Child setTitle={setTitle} />
        </div>
    );
}

export default App;
