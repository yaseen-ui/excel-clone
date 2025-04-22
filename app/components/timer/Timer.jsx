import React, { useEffect, useRef, useState } from "react";
import './Timer.css';

function Timer() {
  const [inputTime, setInputTime] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0,
  });
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef();

  const cleartimer = () => {
    if (intervalRef?.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getTotalSeconds = () => {
    const value =
      Number(inputTime.seconds) +
      Number(inputTime.minutes) * 60 +
      Number(inputTime.hours) * 60 * 60;
    console.log(value, "value");
    return value;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  useEffect(() => {
    cleartimer();
    if (isRunning && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((current) => current - 1);
      }, 1000);
    }
    return () => cleartimer();
  }, [isRunning, inputTime]);


  const getMinutes = (min) => {
    return min % 60;
  }

  useEffect(() => {
    if (totalSeconds > 0) {
      setInputTime(() => ({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor(getMinutes(totalSeconds / 60)),
        seconds: Math.floor(totalSeconds % 60),
      }));
    }
  }, [totalSeconds]);

  const handleStart = () => {
    cleartimer();
    const tempSeconds = getTotalSeconds();
    setTotalSeconds(tempSeconds);
    startTimer();
  };

  const start = () => {
    setIsRunning(true);
    handleStart();
  };

  const stop = () => {
    setIsRunning(false);
    cleartimer();
    setInputTime({
      seconds: 0,
      minutes: 0,
      hours: 0,
    });
    setTotalSeconds(0);
  };

  const pause = () => {
    setIsRunning(false);
    clearInterval();
  };

  const changeInputTime = (value, key) => {
    setInputTime((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="layout">
     <div>
        <h1>Countdown Timer</h1>
    <div className="body">
        <div>
          <label style={{ display: "block" }}>Hours</label>
          <input
            onChange={(e) => changeInputTime(e.target.value, "hours")}
            value={inputTime.hours}
          />
        </div>
        <div>
          <label style={{ display: "block" }}>Minutes</label>
          <input
            onChange={(e) => changeInputTime(e.target.value, "minutes")}
            value={inputTime.minutes}
          />
        </div>
        <div>
          <label style={{ display: "block" }}>Seconds</label>
          <input
            onChange={(e) => changeInputTime(e.target.value, "seconds")}
            value={inputTime.seconds}
          />
        </div>
    </div>
     <div className="footer">
        {!isRunning && <button className="start-btn" onClick={start}>Start</button>}

        {isRunning && <button className="start-btn" onClick={pause}>Pause</button>}

        <button onClick={stop} className="stop-btn">Reset</button>
     </div>
     </div>
    </div>
  );
}

export default Timer;
