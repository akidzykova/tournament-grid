"use client";

import { useState } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DayPicker } from "react-day-picker";

interface UIDataPickerProps {
    placeholder?: string;
    onSelect?: (date: string | undefined) => void;
}

export const UIDataPicker: React.FC<UIDataPickerProps> = ({
    placeholder = "Выберите дату",
    onSelect
  }) => {
    const [selected, setSelected] = useState<Date>();
    const [isOpen, setOpen] = useState<boolean>(false);

    const handleSelect = (date?: Date) => {
        setSelected(date);
        setOpen(false);
      
        const formatted = date ? format(date, "yyyy-MM-dd") : undefined;
        onSelect?.(formatted);
      }

    return (
        <Container>
            <InputWrapper onClick={() => setOpen(!isOpen)}>
                <span>{selected ? format(selected, "dd.MM.yyyy") : placeholder}</span>
                <img src="UI/data-picker.svg" alt="calendar"/>
            </InputWrapper>
            {isOpen && (
                <Popup>
                    <DayPicker
                        mode="single"
                        selected={selected}
                        onSelect={handleSelect}
                        locale={ru}
                        weekStartsOn={1}
                    />
                </Popup>
            )}
        </Container>
    );
}

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px 16px;
  background-color: #111115;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;

  img {
    width: 18px;
    opacity: 0.6;
  }
`;

const Popup = styled.div`
  position: absolute;
  width: 100%;
  z-index: 10;
  top: 100%;
  left: 0;
  background: #111115;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  overflow: hidden;
`;