import { useState } from "react";
import StartArea from "./components/StartArea"
import type { ShapeColor, ShapesWithArea } from "./types/Shape";
import DropArea from "./components/DropArea";
import { DragNDropProvider } from "./lib/dnd/context";
import BinArea from "./components/BinArea";

type ShapesWithAreaKey = keyof ShapesWithArea;

function App() {
  const [shapesWithArea, setShapesWithArea] = useState<ShapesWithArea>({
    start: [],
    dragA: [],
    dragB: [],
  });
  const [dragStartArea, setDragStartArea] = useState<ShapesWithAreaKey | null>(null);

  const createShape = (area: ShapesWithAreaKey) => (color: ShapeColor) => {
    setShapesWithArea((prevShapesWithArea) => ({
      ...prevShapesWithArea,
      [area]: prevShapesWithArea[area].concat({ color }),
    }));
  }

  const moveShape = (from: ShapesWithAreaKey, to: ShapesWithAreaKey, index: number) => {
    if (from === to) return;

    setShapesWithArea((prevShapesWithArea) => ({
      ...prevShapesWithArea,
      [from]: prevShapesWithArea[from].filter((_, i) => i !== index),
      [to]: prevShapesWithArea[to].concat(prevShapesWithArea[from][index]),
    }));
  }

  const removeShape = (area: ShapesWithAreaKey, index: number) => {
    setShapesWithArea((prevShapesWithArea) => ({
      ...prevShapesWithArea,
      [area]: prevShapesWithArea[area].filter((_, i) => i !== index),
    }));
  }

  const handleDragStart = (from: ShapesWithAreaKey) => () => {
    setDragStartArea(from);
  }

  const handleDrop = (to: ShapesWithAreaKey | 'bin') => (index: number) => {
    if (!dragStartArea) {
      throw new Error('dragStartArea must be set before drop event');
    }

    if (to === 'bin') {
      removeShape(dragStartArea, index);
    } else {

      moveShape(dragStartArea, to, index);
    }
  }

  return (
    <DragNDropProvider>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StartArea
          shapes={shapesWithArea.start}
          createShape={createShape('start')}
          onDragStart={handleDragStart('start')}
        />
        <DropArea
          shapes={shapesWithArea.dragA}
          onDrop={handleDrop('dragA')}
          onDragStart={handleDragStart('dragA')} />
        <DropArea
          shapes={shapesWithArea.dragB}
          onDrop={handleDrop('dragB')}
          onDragStart={handleDragStart('dragB')} />
        <BinArea
          onDrop={handleDrop('bin')} />
      </div>
    </DragNDropProvider>
  )
}

export default App;
