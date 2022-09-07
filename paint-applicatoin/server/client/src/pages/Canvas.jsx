import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Tools from "../components/Tools";
import { fabric } from "fabric";
import io from "socket.io-client";
import { useRef } from "react";
import { host } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";

const Canvas = () => {
  const navigate = useNavigate();
  const socket = useRef();
  const [canvas, setCanvas] = useState(undefined);
  useEffect(() => {
    const run = async () => {
      if (await JSON.parse(localStorage.getItem("user"))) {
        navigate("/");
      } else {
        navigate("/login");
      }
    };
    run();
  }, []);
  useEffect(() => {
    setCanvas(initCanvas());
  }, []);

  useEffect(() => {}, []);
  const initCanvas = () => {
    return new fabric.Canvas("canvas", {
      height: 600,
      width: 600,
      backgroundColor: "white",
      selection: false,
    });
  };
  useEffect(() => {
    socket.current = io(host);
  }, []);

  return (
    <Container>
      <div className="tools">
        <Tools canvas={canvas} socket={socket} />
      </div>
      <div className="drawing-container">
        <canvas id="canvas" />
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  background-color: #3d536b;
  height: 100vh;
  width: 100vw;
  flex-direction: row;
  .tools {
    height: 100vh;
    width: 20vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .drawing-container {
    height: 100vh;
    width: 80vw;
    display: flex;
    justify-content: center;
    align-items: center;
    canvas {
      width: 100%;
    }
  }
`;
export default Canvas;
