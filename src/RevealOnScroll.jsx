import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1];

const OFFSETS = {
  right: (d) => ({ x: d, y: 0 }),
  left:  (d) => ({ x: -d, y: 0 }),
  up:    (d) => ({ x: 0, y: d }),
  down:  (d) => ({ x: 0, y: -d }),
};

export function RevealOnScroll({
  children,
  delay = 0,
  duration = 0.8,
  direction = "right",
  className,
  once = true,
  amount = 0.2,
  desktopDistance = 80,
  mobileDistance = 40,
}) {
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(desktopDistance);

  useEffect(() => {
    const update = () =>
      setDist(window.innerWidth < 768 ? mobileDistance : desktopDistance);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [desktopDistance, mobileDistance]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const off = (OFFSETS[direction] || OFFSETS.right)(dist);

  return (
    <motion.div
      className={className}
      style={{ willChange: "opacity, transform" }}
      initial={{ opacity: 0, x: off.x, y: off.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default RevealOnScroll;
