import { useEffect, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";

interface Note {
  text: string;
  color: string;
  rotate?: number;
  top?: number;
  left?: number;
  offset?: number[];
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<number>();
  const colors = ["#d070af", "#2fb4ab", "#d9a75f"];
  const rotates = [0, 1, 2, 3, 4, -1, -2, -3, -4];
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const n = window.localStorage.getItem("notes");
    if (n) setNotes(JSON.parse(n));
  }, []);

  function handleNotes(index: number, val: string) {
    const newNotes = [...notes];
    newNotes[index].text = val;
    setNotes(newNotes);
  }

  function handleAddNote() {
    if (active !== undefined) {
      setActive(undefined);
      return;
    }
    const rand = Math.floor(Math.random() * colors.length);
    const rRand = Math.floor(Math.random() * colors.length);
    setNotes((x) => [
      ...x,
      { text: "", color: colors[rand], rotate: rotates[rRand] },
    ]);
  }

  function handleNoteBlur(index: number) {
    const rRand = Math.floor(Math.random() * rotates.length);
    const newNotes = [...notes];
    newNotes[index].rotate = rotates[rRand];
    window.localStorage.setItem("notes", JSON.stringify(newNotes));
    setNotes(newNotes);
  }

  const bind = useDrag((options) => {
    const {
      movement: [x, y],
      args: [index],
      first,
      last,
    } = options;

    const el = ref.current[index];
    const o = notes[index].offset;

    const newNotes = [...notes];
    if (first) {
      setActive(index);
      newNotes[index].offset = [el.offsetLeft, el.offsetTop];
    }
    if (last) {
      textRef.current?.focus();
      newNotes[index].offset = [el.offsetLeft, el.offsetTop];
    }
    if (!o) return;
    const l = o[0];
    const t = o[1];
    newNotes[index].left = l + x;
    newNotes[index].top = t + y;
    newNotes[index].rotate = 0;
    setNotes(newNotes);
  });

  return (
    <div
      className="relative w-screen h-screen p-6 overflow-hidden bg-gray-800"
      onClick={handleAddNote}
    >
      {notes.map((note, index) => {
        return (
          <div
            {...bind(index)}
            ref={(r) => {
              if (r) ref.current[index] = r;
            }}
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setActive(index);
            }}
            className="absolute p-4 shadow-lg w-60 max-h-[240px] aspect-square cursor-grab"
            style={{
              backgroundColor: note.color,
              top: note.top,
              left: note.left,
              transform: `rotate(${note.rotate}deg)`,
              zIndex: active === index ? 10 : 2
            }}
          >
            {active === index ? (
              <textarea
                ref={textRef}
                onBlur={() => handleNoteBlur(index)}
                value={note.text || "write a note, we will keep it!"}
                className="w-full h-full bg-transparent border-none outline-none"
                onChange={(e) => handleNotes(index, e.target.value)}
              />
            ) : (
              <div className="overflow-hidden ">
                {note.text || "write a note, we will keep it!"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
