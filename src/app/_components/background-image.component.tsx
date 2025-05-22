"use client";

import styled from "styled-components";

export const BackgroundImageComponent = () => {
    return (
        <BackgroundImageStyle src='/indexpage_image.png'></BackgroundImageStyle>
    );
}

const BackgroundImageStyle = styled.img`
    z-index: -1;
    
    position: absolute;
    top: 0;
    left: 0;
    
    width: 100%;
    height: 100%;
    
    object-fit: cover;
`