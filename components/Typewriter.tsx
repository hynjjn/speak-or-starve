"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type Props = {
  text: string;
  speedMs?: number;
  className?: string;
  onDone?: () => void;
};

export type TypewriterHandle = {
  complete: () => void;
};

const Typewriter = forwardRef<TypewriterHandle, Props>(function Typewriter(
  { text, speedMs = 28, className, onDone },
  ref,
) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  const intervalRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useImperativeHandle(ref, () => ({
    complete: () => {
      if (doneRef.current) return;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      doneRef.current = true;
      setShown(text);
      setDone(true);
      onDoneRef.current?.();
    },
  }));

  useEffect(() => {
    setShown("");
    setDone(false);
    doneRef.current = false;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        intervalRef.current = null;
        doneRef.current = true;
        setDone(true);
        onDoneRef.current?.();
      }
    }, speedMs);
    intervalRef.current = id;
    return () => {
      window.clearInterval(id);
      intervalRef.current = null;
    };
  }, [text, speedMs]);

  return (
    <span className={className}>
      {shown}
      {!done && <span className="animate-blink">▏</span>}
    </span>
  );
});

export default Typewriter;
