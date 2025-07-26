import type { ShapeColor } from "../types/Shape";

export type ShapeProps = { color: ShapeColor };

const Shape = ({ color }: ShapeProps) => {
  return (
    <div style={{ width: 40, height: 40, backgroundColor: color }} />
  )
}

export default Shape;
