import React, {useState} from 'react';
import useDebounceFn from './hooks/useDebounceFn';

function App() {
    const [num, setNum] = useState(0);
    const onClick = useDebounceFn(
        (e) => {
            console.log(e);
            setNum(num + 1);
        },
        {
            wait: 3000,
            leading: true,
            trailing: false,
        },
    );

    return (
        <div className="App">
            {num}
            <button onClick={(e) => onClick.run(e)}>点击</button>
        </div>
    );
}

export default App;
