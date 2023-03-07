import React, {useState} from 'react';
import {Image} from 'antd';

interface AntDesignImagePropsType {
    src: string;
    previewList?: string[];
}

function AntDesignImage(props: AntDesignImagePropsType) {
    const {src, previewList} = props;
    const [visible, setVisible] = useState(false);

    const getCurrentIndex = () => {
        if (previewList && previewList.length) {
            return previewList.indexOf(src);
        }
        return 0;
    };
    const renderPreview = () => {
        if (previewList && previewList.length) {
            return (
                <>
                    {previewList.map((item, index) => {
                        return <Image key={index} src={item} />;
                    })}
                </>
            );
        }
        return <Image src={src} />;
    };

    return (
        <>
            <Image
                preview={{visible: false}}
                src={src}
                onClick={() => setVisible(true)}
            />
            <div style={{display: 'none'}}>
                <Image.PreviewGroup
                    preview={{
                        visible,
                        current: getCurrentIndex(),
                        onVisibleChange: (vis) => setVisible(vis),
                    }}>
                    {renderPreview()}
                </Image.PreviewGroup>
            </div>
        </>
    );
}

export default AntDesignImage;
