import Shape, { type ShapeProps } from "./Shape";
import Drag from "../lib/dnd/components/Drag";
import Drop from "../lib/dnd/components/Drop";

const DropArea = ({ shapes, onDrop, onDragStart }: { shapes: Array<ShapeProps>, onDrop: (index: number) => void, onDragStart: VoidFunction }) => {
  return (
    <Drop name='moveShape' onDrop={(args) => {
      onDrop(args.value);
    }}>

      <div>
        <h2>Start Point</h2>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 400, height: 400, border: '1px solid black' }}>
          {shapes.map((shape, shapeIdx) => (
            <Drag name="moveShape" value={shapeIdx} onDragStart={onDragStart} >
              <Shape {...shape} />
            </Drag>
          ))}
        </div>
      </div >
    </Drop>
  )
}

export default DropArea;
