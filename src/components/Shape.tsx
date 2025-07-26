import type { HTMLAttributes } from "react";
import type { ShapeColor } from "../types/Shape";

export type ShapeProps = { color: ShapeColor } & HTMLAttributes<HTMLDivElement>;

const Shape = ({ color, style, ...rest }: ShapeProps) => {
  return (
    <div style={{ width: 40, height: 40, backgroundColor: color, ...style }}{...rest} />
  )
}

export default Shape;
