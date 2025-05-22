import React, {useCallback, useEffect} from "react";
import { Portal } from "./portal.component";
import styled from "styled-components";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <Portal>
            <Backdrop onClick={handleBackdropClick}>
                <Menu>
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                    {children}
                </Menu>
            </Backdrop>
        </Portal>
    );
};

const Backdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const Menu = styled.div`
    position: relative;

    background: #0C0C0F;
    box-shadow: 0 0 8px 1px rgba(81, 81, 81, 0.1);

    padding: 24px;

    border-radius: 8px;

    max-width: 500px;
    width: 90%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
    color: white;
`;