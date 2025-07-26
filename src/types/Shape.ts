import type { ComponentProps } from "react";
import type Shape from "../components/Shape";

export type ShapeColor = 'red' | 'blue' | 'green';

export type ShapesWithArea = Record<'start' | 'dragA' | 'dragB', Array<ComponentProps<typeof Shape>>>
