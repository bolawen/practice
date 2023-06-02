import React from 'react';
import 'react-photo-view/dist/react-photo-view.css';
import {PhotoProvider, PhotoView as PhotoViewWrap} from 'react-photo-view';

interface PhotoViewPropsType {
    src: string;
    previewList?: string[];
}

function PhotoView(props: PhotoViewPropsType) {
    const {src, previewList} = props;

    const renderPreview = () => {
        if (previewList && previewList.length) {
            return (
                <>
                    {previewList.map((item, index) => {
                        return (
                            <PhotoViewWrap key={index} src={item}>
                                {item === src ? <img src={item} /> : undefined}
                            </PhotoViewWrap>
                        );
                    })}
                </>
            );
        }
        return (
            <PhotoViewWrap src={src}>
                <img src={src} />
            </PhotoViewWrap>
        );
    };
    return (
        <PhotoProvider
            pullClosable={true}
            maskClosable={true}
            photoClosable={true}>
            {renderPreview()}
        </PhotoProvider>
    );
}

export default PhotoView;
