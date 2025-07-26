
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
