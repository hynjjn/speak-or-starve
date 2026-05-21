"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  speedMs?: number;
  className?: string;
  onDone?: () => void;
};

export default function Typewriter({ text, speedMs = 28, className, onDone }: Props) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, onDone]);

  return (
    <span className={className}>
      {shown}
      {!done && <span className="animate-blink">▏</span>}
    </span>
  );
}
