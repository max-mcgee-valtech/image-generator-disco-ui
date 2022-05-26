import { Button } from "@mui/material";
import styled from "styled-components";

export const StyledButton = styled(Button)`
  padding: 0.6rem 3rem;
  margin-bottom: 0.625rem;
  font-weight: 500;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: 5px solid #06477b;
  -webkit-box-shadow: 3px 4px #0f9;
  box-shadow: 3px 4px #0f9;
  color: #fff;
  background-color: #000;
  white-space: nowrap;
  cursor: pointer;
  overflow: hidden;
  vertical-align: middle;
  text-transform: uppercase;
  position: relative;
  outline: 0;
  letter-spacing: 0.0625rem;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  width: fit-content;

  &:hover {
    border: 5px solid #000;
    background-color: #0f9;
    color: #000;
  }
`;

export const ImageWrapper = styled.div`
  width: 100%;
  margin: 2rem 0;
  height: 70px;
  position: relative;
  @media screen and (max-width: 1024px) {
    height: 50px;
  }
`;
