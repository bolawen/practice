import { useState } from 'react';
import { Color } from "@rc-component/color-picker"
import { SketchPicker as SketchPickerReactColor } from 'react-color'

function SketchPicker(){
    const [color,setColor] = useState(new Color('#163cff').toRgb());

      const handleChange = (color) => {
        setColor(color.rgb)
      };

    return <SketchPickerReactColor color={color} onChange={ handleChange }/>
}

export default SketchPicker