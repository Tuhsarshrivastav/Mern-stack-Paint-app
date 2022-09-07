import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TbRectangle, TbZoomPan } from "react-icons/tb";
import { GrClear } from "react-icons/gr";
import {
  BsCircle,
  BsFillPencilFill,
  BsEraserFill,
  BsTriangle,
} from "react-icons/bs";
import { AiOutlineLine } from "react-icons/ai";
import { fabric } from "fabric";
import { useRef } from "react";
import { SketchPicker } from "react-color";
import { v1 as uuid } from "uuid";
import Logout from "./Logout";

const Tools = ({ canvas, socket }) => {
  const togglePencil = useRef(false);
  const toggleZoom = useRef(false);
  const [colorHexCode, setColorHexCode] = useState("#000000");

  const handleAddObject = (canvi, objectType) => {
    if (canvi) {
      const centerOfCanva = canvi.getCenter();
      let object;
      if (objectType === "rect") {
        object = new fabric.Rect({
          height: 100,
          width: 100,
          fill: "yellow",
          left: centerOfCanva.left,
          top: centerOfCanva.top,
        });
      }

      if (objectType === "circle") {
        object = new fabric.Circle({
          radius: 50,
          fill: "green",
          left: centerOfCanva.left,
          top: centerOfCanva.top,
        });
      }

      if (objectType === "line") {
        object = new fabric.Line([50, 50, 450, 50], {
          stroke: "black",
          strokeWidth: 2,
        });
      }
      if (objectType === "triangle") {
        object = new fabric.Triangle({
          width: 100,
          height: 100,
          fill: "blue",
          left: centerOfCanva.left,
          top: centerOfCanva.top,
        });
      }
      object.set({ id: uuid() });
      canvi.add(object);
      canvi.renderAll();
      socket.current.emit("object-added", { obj: object, id: object.id });
    }
  };
  const handleDrawingMode = (canvas) => {
    togglePencil.current = !togglePencil.current;
    console.log(togglePencil);
    if (togglePencil.current) {
      canvas.on("mouse:move", (event) => {
        canvas.isDrawingMode = true;
        canvas.renderAll();
      });
    } else {
      canvas.off("mouse:move");
      canvas.isDrawingMode = false;

      canvas.renderAll();
    }
  };

  const handleZoom = (canvas) => {
    toggleZoom.current = !toggleZoom.current;
    console.log(toggleZoom.current);
    if (toggleZoom.current) {
      canvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    } else {
      canvas.off("mouse:wheel");
    }
  };

  const handleErase = (canvas) => {
    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  useEffect(() => {
    if (canvas) {
      canvas.on("object:modified", (e) => {
        socket.current.emit("object-modified", {
          obj: e.target,
          id: e.target.id,
        });
        console.log(e);
      });

      canvas.on("object:moving", function (options) {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
          };
          socket.current.emit("object-modified", modifiedObj);
        }
      });
    }
  }, [canvas]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("new-modification", (data) => {
        const { obj, id } = data;
        canvas.getObjects().forEach((object) => {
          if (object.id === id) {
            object.set(obj);
            object.setCoords();
            canvas.renderAll();
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    if (socket.current) {
      socket.current.off("new-add");
      socket.current.on("new-add", (data) => {
        const { obj, id } = data;
        const centerOfCanva = canvas.getCenter();
        let object;

        if (obj.type === "rect") {
          object = new fabric.Rect({
            height: obj.height,
            width: obj.width,
            fill: "yellow",
            left: centerOfCanva.left,
            top: centerOfCanva.top,
          });
        } else if (obj.type === "circle") {
          object = new fabric.Circle({
            radius: 50,
            fill: "green",
            left: centerOfCanva.left,
            top: centerOfCanva.top,
          });
        } else if (obj.type === "triangle") {
          object = new fabric.Triangle({
            width: 100,
            height: 100,
            fill: "blue",
            left: centerOfCanva.left,
            top: centerOfCanva.top,
          });
        } else if (obj.type === "line") {
          object = new fabric.Line([50, 50, 450, 50], {
            stroke: "black",
            strokeWidth: 2,
          });
        }

        object.set({ id: id });
        canvas.add(object);
        canvas.renderAll();
      });
    }
  }, [canvas]);

  const handleColorChangeOfObject = (e, canvas) => {
    const activeObject = canvas.getActiveObject();
    console.log(activeObject);
    if (activeObject) {
      activeObject.set("fill", e.hex);
      canvas.renderAll();
    }
    console.log(activeObject);
  };

  const handleClearAll = (canvas) => {
    const getAllObject = canvas.getObjects();
    getAllObject.forEach((o) => {
      canvas.remove(o);
    });
    canvas.renderAll();
  };

  const handleRestore = (canvas) => {};
  return (
    <Container>
      <Logout />
      <div className="all-tools">
        <div className="shapes-container">
          <button type="button" onClick={() => handleAddObject(canvas, "rect")}>
            <TbRectangle />
          </button>
          <button type="button" onClick={() => handleAddObject(canvas, "line")}>
            <AiOutlineLine />
          </button>
          <button
            type="button"
            onClick={() => handleAddObject(canvas, "circle")}
          >
            <BsCircle />
          </button>
          <button>
            <BsTriangle onClick={() => handleAddObject(canvas, "triangle")} />
          </button>
        </div>
        <div className="tools-container">
          <button onClick={() => handleDrawingMode(canvas)}>
            <BsFillPencilFill />
          </button>
          <button onClick={() => handleErase(canvas)}>
            <BsEraserFill />
          </button>
          <button onClick={() => handleZoom(canvas)}>
            <TbZoomPan />
          </button>

          <button onClick={() => handleClearAll(canvas)}>
            <GrClear />
          </button>
        </div>
      </div>

      <div className="colors-container">
        <SketchPicker
          color={colorHexCode}
          onChange={(e) => handleColorChangeOfObject(e, canvas)}
        />
      </div>
    </Container>
  );
};
const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #131324;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  .all-tools {
    display: flex;
    gap: 1rem;
    width: 100%;
    justify-content: space-evenly;
    .shapes-container {
      background-color: #131324;
      display: flex;
      gap: 0.8rem;
      flex-direction: column;
      width: 5rem;
      border-radius: 0.4rem;
      padding: 0.4rem;
      border: 0.1rem solid #4e0eff;
      button {
        background-color: #997af0;
        padding: 1rem 1rem;
        border: none;
        cursor: pointer;
        border-radius: 0.4rem;
        font-size: 1rem;
        text-transform: uppercase;
        transition: 0.5s ease-in-out;
        &:hover {
          background-color: #4e0eff;
        }
        svg {
          font-size: 2rem;

          color: white;
        }
      }
    }
    .tools-container {
      background-color: #131324;
      display: flex;
      gap: 0.8rem;
      flex-direction: column;
      width: 5rem;
      border-radius: 0.4rem;
      padding: 0.4rem;
      border: 0.1rem solid #4e0eff;
      button {
        background-color: #997af0;
        padding: 1rem 1rem;
        border: none;
        cursor: pointer;
        border-radius: 0.4rem;
        font-size: 1rem;
        text-transform: uppercase;
        transition: 0.5s ease-in-out;
        &:hover {
          background-color: #4e0eff;
        }
        svg {
          font-size: 2rem;

          color: white;
        }
      }
    }
  }
  .colors-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
export default Tools;
