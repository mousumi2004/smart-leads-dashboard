import { useEffect, useState } from "react";

const heading = "Smart Leads Dashboard";

export function TypingHeading() {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    let timeout = 0;
    const startAt = performance.now() + 260;
    const duration = 1450;

    const tick = () => {
      const elapsed = Math.max(0, performance.now() - startAt);
      const progress = Math.min(1, elapsed / duration);
      const nextLength = Math.floor(progress * heading.length);
      setVisibleLength(nextLength);

      if (progress < 1) {
        timeout = window.setTimeout(tick, 40);
      }
    };

    timeout = window.setTimeout(tick, 40);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <h1
      className="relative mt-6 text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-7xl lg:text-8xl"
      aria-label={heading}
    >
      <span className="invisible block" aria-hidden="true">
        {heading}
      </span>
      <span className="absolute inset-0 block" aria-hidden="true">
        {heading.slice(0, visibleLength)}
        <span className="typing-cursor" />
      </span>
    </h1>
  );
}
