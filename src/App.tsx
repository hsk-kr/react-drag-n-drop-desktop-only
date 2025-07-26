import { useState, type ComponentProps } from "react";
import StartArea from "./components/StartArea"
import Shape from "./components/Shape";
import type { ShapeColor, ShapesWithArea } from "./types/Shape";
import DropArea from "./components/DropArea";

function App() {
  const [shapesWithArea, setShapesWithArea] = useState<ShapesWithArea>({
    start: [],
    dragA: [],
    dragB: [],
  });
  const [dragStartArea, setDragStartArea] = useState<keyof ShapesWithArea | null>(null);

  const createShape = (area: keyof ShapesWithArea) => (color: ShapeColor) => {
    setShapesWithArea((prevShapesWithArea) => ({
      ...prevShapesWithArea,
      [area]: prevShapesWithArea[area].concat({ color }),
    }));
  }

  const moveShape = (from: keyof ShapesWithArea, to: keyof ShapesWithArea, index: number) => {
    setShapesWithArea((prevShapesWithArea) => ({
      ...prevShapesWithArea,
      [from]: prevShapesWithArea[from].filter((_, i) => i !== index),
      [to]: prevShapesWithArea[to].concat(prevShapesWithArea[from]),
    }));
  }

  const handleDragStart = (area: keyof ShapesWithArea) => () => {
    setDragStartArea(area);
  }

  return (
    <>
      <StartArea shapes={shapesWithArea.start} createShape={createShape('area')} onDragStart={handleDragStart('start')} />
      <DropArea onDrop={moveShape} onDragStart={handleDragStart('dragA')} />
    </>
  )
}

export default App
