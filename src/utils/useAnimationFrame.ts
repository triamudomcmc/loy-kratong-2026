import {useEffect, useRef} from "react";

type AnimationFrameCallback = (delta: number) => void;
type StopCallback = (delta: number) => boolean;

export const useAnimationFrame = (callback: AnimationFrameCallback, shouldStop: StopCallback, shouldStart: boolean = true) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      // delta time in millisecs
      const deltaTime = time - previousTimeRef.current;

      if (shouldStop(deltaTime)) cancelAnimationFrame(requestRef.current as number);
      else callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (shouldStart) {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current as number);
    }
  }, [shouldStart]); // Make sure the effect runs only once

  // eslint-disable-next-line react-hooks/refs -- legacy API, returns the latest frame id
  return requestRef.current;
};

// Example
/*
const Counter = () => {
  const [count, setCount] = React.useState(0);

  useAnimationFrame((deltaTime) => {
    setCount((prevCount) => (prevCount + deltaTime * 0.01) % 100);
  });

  return <div>{Math.round(count)}</div>;
};

ReactDOM.render(<Counter />, document.getElementById("app"));
*/
