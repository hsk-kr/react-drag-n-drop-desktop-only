# React Drag and Drop Example (Desktop only)

example preview: https://hsk-kr.github.io/react-drag-n-drop-desktop-only

---

# Dev.to

![Example Preview](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g7vrkgsx1340och47z1u.png)

Preview: https://hsk-kr.github.io/react-drag-n-drop-desktop-only/

Github: https://github.com/hsk-kr/react-drag-n-drop-desktop-only

---

The other day, I got a report from my Chrome extension GitHub repository saying that the extension doesn't work anymore.

It was a project I built in 2024, one year ago. I opened the project and realized that most of the dependencies were outdated. I thought, “Okay, let’s update the dependencies first and make it brand new.” I updated everything — and as a result, I couldn’t even start the dev server.

The breaking changes were okay. The project is quite small, and I could fix things — I’m still working on it, though. Another problem was that the `react-dnd` package wasn’t compatible with my project setup. I checked the npm website and saw that the last publish was 3 years ago.

Okay, it still works fine — but 3 years ago? That made me feel a bit uneasy. I originally installed the package just to use a drag-and-drop feature, but thinking about it now, what I need is very limited. I just need to implement dragging a component from one point to another. I don’t even need to support mobile browsers since this is a Chrome extension.

![npm humor meme](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7qlcdd7b0anm1rpjtft7.png)

If you follow programming-related content on social media, you might have seen this meme. I’ve also been in situations where I installed some dependencies even though I didn’t need most of their features. It makes sense that a library provides many features — we don’t use it just for one thing. But if we only need a small part of the implementation and it doesn’t affect the core logic, it might be better to write your own instead of relying on someone else’s code.

So I decided to implement drag and drop the way I needed. It doesn’t fit every use case because it’s not standardized, but I wanted to share it for anyone who might find it useful.

---

## Implementation

The implementation consists of five files:

- context
- types
- components – Drag, Drop
- hooks – useDnd

Let’s look at the code one by one.

### types.ts

```typescript
type DragNDropKeyValueSet = {
  shape: number;
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
```

- `EndDragCallback`: An event triggered when dropping
- `StartDragCallback`: An event triggered when starting a drag
- `DragNDropName`: Each drag-and-drop item has a name to identify its value
- `DragNDropValue`: A value from `DragNDropKeyValueSet`
- `DragNDropKeyValueSet`: A name-value set. A component that receives a drop event will get this value from the component that started the drag.
- `DragNDropKeyValuePair`: A single type from `DragNDropKeyValueSet`
---

### context.tsx

```typescript
sjimport {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import type {
  DragNDropKeyValuePair,
  DragNDropName,
  EndDragCallback,
  StartDragCallback,
} from './types';

type DragNDropContextType = {
  dragging: boolean;
  startDrag: (
    callback?: StartDragCallback,
    data?: DragNDropKeyValuePair
  ) => void;
  endDrag: (name: DragNDropName, callback?: EndDragCallback) => void;
};

export const DragNDropContext = createContext<DragNDropContextType>(
  {} as DragNDropContextType
);

export const DragNDropProvider = ({ children }: { children?: ReactNode }) => {
  const [dragging, setDragging] =
    useState<DragNDropContextType['dragging']>(false);
  const [data, setData] = useState<DragNDropKeyValuePair | undefined>(
    undefined
  );

  const startDrag: DragNDropContextType['startDrag'] = useCallback(
    (callback, data) => {
      const hasCallbackReturnedFalse = callback?.() === false;

      if (hasCallbackReturnedFalse) return;
      setData(data);
      setDragging(true);
    },
    [dragging]
  );

  const endDrag: DragNDropContextType['endDrag'] = useCallback(
    (name, callback) => {
      const areDifferentNames = data && name !== data?.name;
      const hasCallbackReturnedFalse = data ? callback?.(data) === false : false;

      if (!dragging || areDifferentNames || hasCallbackReturnedFalse) return;
      setDragging(false);
    },
    [data, dragging]
  );

  useEffect(() => {
    const setDraggingFalse = () => setDragging(false);

    window.addEventListener('dragend', setDraggingFalse, { capture: true });

    return () => {
      window.removeEventListener('dragend', setDraggingFalse);
    };
  }, []);

  return (
    <DragNDropContext value={{ dragging, startDrag, endDrag }}>
      {children}
    </DragNDropContext>
  );
};
```

The context holds one value at a time and manages it through drag events from the `Drag` and `Drop` components.

---

### Drag.tsx

```typescript
import {
  Children,
  cloneElement,
  type ReactElement,
  type HTMLAttributes,
  useCallback,
} from 'react';
import useDnd from '../useDnd';
import type { DragNDropName, DragNDropValue, StartDragCallback } from '../types';

type Props<K extends DragNDropName> = {
  children: ReactElement<
    Pick<HTMLAttributes<HTMLElement>, 'draggable' | 'onDragStart'>
  >;
  name: K;
  value: DragNDropValue<K>;
  onDragStart?: StartDragCallback;
};

export const Drag = <K extends DragNDropName>({
  children,
  name,
  value,
  onDragStart,
}: Props<K>) => {
  const { startDrag } = useDnd();

  const handleDragStart = useCallback(() => {
    startDrag(onDragStart, { name, value });
  }, [name, value, onDragStart, startDrag]);

  return Children.map(children, (child) =>
    cloneElement(child, {
      ...child.props,
      draggable: true,
      onDragStart: handleDragStart,
    })
  );
};

export default Drag;
```

It passes an `onDragStart` event to the child component and makes it draggable.


---

### Drop.tsx

```typescript
import {
  Children,
  cloneElement,
  type ReactElement,
  type HTMLAttributes,
  useCallback,
  type DragEvent,
} from 'react';
import useDnd from '../useDnd';
import type { DragNDropName, EndDragCallback } from '../types';

type Props = {
  children: ReactElement<
    Pick<HTMLAttributes<HTMLElement>, 'onDrop' | 'onDragOver'>
  >;
  name: DragNDropName;
  onDrop?: EndDragCallback;
};

const Drop = ({ children, name, onDrop }: Props) => {
  const { endDrag } = useDnd();

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      endDrag(name, onDrop);
    },
    [name, onDrop, endDrag]
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  return Children.map(children, (child) =>
    cloneElement(child, { ...child.props, onDrop: handleDrop, onDragOver })
  );
};

export default Drop;
```

It passes the `onDrop` event to the child component, and also the `onDragOver` event to prevent the default behavior and make it work based on our logic.

---

### useDnd.tsx

```typescript
import { useContext } from 'react';
import { DragNDropContext } from './context';

const useDnd = () => {
  return useContext(DragNDropContext);
};

export default useDnd;
```

---

## Usage

Now, let's see how to use it.

In the example, there are three components: the start point, drag point, and bin.

You can create a rectangle by clicking a button — red, blue, or green — and they’ll be placed in the start point.

You can move a component from the start point or a drag point to another drag point by dragging it.

If you drag it into the bin, it will be deleted.

---

### types.ts

```typescript
import type { ComponentProps } from "react";
import type Shape from "../components/Shape";

export type ShapeColor = 'red' | 'blue' | 'green';

export type ShapesWithArea = Record<'start' | 'dragA' | 'dragB', Array<ComponentProps<typeof Shape>>>
```

The types are shared across the components.

---

### Shape.tsx

```typescript
import type { HTMLAttributes } from "react";
import type { ShapeColor } from "../types/Shape";

export type ShapeProps = { color: ShapeColor } & HTMLAttributes<HTMLDivElement>;

const Shape = ({ color, style, ...rest }: ShapeProps) => {
  return (
    <div style={{ width: 40, height: 40, backgroundColor: color, ...style }}{...rest} />
  )
}

export default Shape;
```

It draws a rectangle using the color from its props.

---

### StartPoint.tsx

```typescript
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
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 150, height: 150, border: '1px solid black', overflowY: 'auto', alignContent: 'flex-start' }}>
        {shapes.map((shape, shapeIdx) => (
          <Drag name="shape" value={shapeIdx} onDragStart={onDragStart}  >
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
```

This is where the `Shape` component is created when you click one of the buttons.

---

### DropArea.tsx

```typescript
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
```

The `shape` can be dropped into this component and can also be moved to another `DropArea`.

---

### Bin.tsx

```typescript

import Drop from "../lib/dnd/components/Drop";

const BinArea = ({ onDrop }: { onDrop: (index: number) => void }) => {
  return (
    <Drop name='shape' onDrop={(args) => {
      onDrop(args.value);
    }}>
      <div>
        <h2>Bin</h2>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 50, height: 50, border: '3px solid black' }} />
      </div >
    </Drop>
  )
}

export default BinArea;
```

If the `Shape` is dropped here, it will be deleted.


---

### App.tsx

```typescript
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
```

The shapes are managed in this component. The `from` and `to` parameters are assigned here, and the `index` is shared through drag and drop. Using those, it moves or deletes a shape based on the drop action.

---

## Conclusion

It seems a bit complicated, to be honest, since this drag-and-drop logic is based on the data structure I’m using in my Chrome extension. The implementation can vary depending on your use case.

The main point is that we don’t need to rely on a library — if the logic is simple enough, it might be better to implement it ourselves.

Thanks for reading this, and I hope you found it helpful.

Happy Coding!

