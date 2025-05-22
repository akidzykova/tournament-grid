"use client";

import { useState } from "react";
import styled from "styled-components";

interface UISelectProps {
    options: string[],
    selectedOption?: string,
    onChange?: (value: string) => void; 
}

export const UISelect = (props: UISelectProps) => {
    const {options, selectedOption, onChange} = props;

    const [IsOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(selectedOption || options[0]);

    return (
        <Wrapper>
            <Selected onClick={() => setIsOpen(!IsOpen)}>
                {selected}
                <img src='../UI/select-arrow.svg' style={IsOpen ? { transform: "rotate(180deg)" } : {}}></img>
            </Selected>
            {IsOpen && (
                <Options>
                    {options.map((option) => (
                        <Option
                            key={option}
                            onClick={() => {setSelected(option);setIsOpen(false);onChange?.(option);}}
                        >
                            {option}
                        </Option>
                    )) }
                </Options>
            )}
        </Wrapper>
    );
}

const Wrapper = styled.div`
  position: relative;
  font-size: 16px;
  font-weight: 400;
  width: 100%;
`;

const Selected = styled.div`
  background: #111115;
  color: white;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Options = styled.ul`
  position: absolute;
  top: 100%;
  width: 100%;
  background: #111115;
  margin-top: 0px;
  list-style: none;
  padding: 0;
  z-index: 10;
`;

const Option = styled.li`
  padding: 16px;
  color: white;
  cursor: pointer;

  &:hover {
    background:rgb(14, 14, 17);
  }
`;