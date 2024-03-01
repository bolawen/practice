import ColorPickerBase, { Color } from '@rc-component/color-picker';
import { useState } from 'react';

function ColorPicker(){
    const [value,setValue] = useState(new Color('#163cff'));

    const handleOnChange = (value: Color)=>{
        setValue(value);
    }

    return <ColorPickerBase value={value} onChange={handleOnChange}/>
}

export default ColorPicker;