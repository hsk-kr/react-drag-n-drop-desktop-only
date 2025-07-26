import type { ShapeProps } from "../../components/Shape";

type DragNDropKeyValueSet = {
  moveShape: number;
};

export type DragNDropKeyValuePair = {
  [K in keyof DragNDropKeyValueSet]: {
    name: K;
    value: DragNDropKeyValueSet[K];
  };
}[keyof DragNDropKeyValueSet];

export type DragNDropName = keyof DragNDropKeyValueSet;

export type DragNDropValue<K extends DragNDropName> = DragNDropKeyValueSet[K];

export type StartDragCallback = () => boolean | void;

export type EndDragCallback = (data: DragNDropKeyValuePair) => boolean | void;
