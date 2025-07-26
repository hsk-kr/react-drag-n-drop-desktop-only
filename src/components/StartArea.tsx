import type { ShapeColor } from "../types/Shape";
import Shape, { type ShapeProps } from "./Shape";
import Drag from "../lib/dnd/components/Drag";

const StartArea = ({ shapes, createShape, onDragStart }: { shapes: Array<ShapeProps>, createShape: (color: ShapeColor) => void, onDragStart: VoidFunction }) => {
  const onCreateShapeClick = (color: ShapeColor) => () => {
    createShape(color);
  }

  return (
    <div>
      <h2>Start Point</h2>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 400, height: 400, border: '1px solid black' }}>
        {shapes.map((shape) => (
          <Drag name="moveShape" value={shape} onDragStart={onDragStart}  >
            <Shape {...shape} />
          </Drag>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={onCreateShapeClick('red')}>Red</button>
        <button onClick={onCreateShapeClick('blue')}>Blue</button>
        <button onClick={onCreateShapeClick('green')}>Green</button>
      </div>
    </div >
  )
}

export default StartArea;
