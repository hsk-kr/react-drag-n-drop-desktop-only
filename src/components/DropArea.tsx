import Shape, { type ShapeProps } from "./Shape";
import Drag from "../lib/dnd/components/Drag";
import Drop from "../lib/dnd/components/Drop";

const DropArea = ({ shapes, onDrop, onDragStart }: { shapes: Array<ShapeProps>, onDrop: (index: number) => void, onDragStart: VoidFunction }) => {
  return (
    <Drop name='shape' onDrop={(args) => {
      onDrop(args.value);
    }}>
      <div>
        <h2>Drag Point</h2>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 200, height: 200, border: '1px solid black', overflowY: 'auto', alignContent: 'flex-start', }}>
          {shapes.map((shape, shapeIdx) => (
            <Drag name="shape" value={shapeIdx} onDragStart={onDragStart} >
              <Shape {...shape} />
            </Drag>
          ))}
        </div>
      </div >
    </Drop>
  )
}

export default DropArea;
