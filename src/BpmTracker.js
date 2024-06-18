import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip
);

const BpmTracker = () => {
  const [tapTimes, setTapTimes] = useState([]);
  const [bpmValues, setBpmValues] = useState([]);
  const [averageBpmValues, setAverageBpmValues] = useState([]);
  const [averageBpm, setAverageBpm] = useState(0);
  const [displayMode, setDisplayMode] = useState("exact");
  const [startTime, setStartTime] = useState(0);
  const [windowSize, setWindowSize] = useState(4);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (tapTimes.length > 0) {
      const interval = (now - tapTimes[tapTimes.length - 1]) / 1000;
      const bpm = (1 / interval) * 60;
      const newBpmValues = [...bpmValues, bpm];
      setBpmValues(newBpmValues);
      setAverageBpm(calculateAverageBpm(newBpmValues));
      setAverageBpmValues([...averageBpmValues, averageBpm]);
    } else {
      setStartTime(now);
    }
    setTapTimes([...tapTimes, now]);
  }, [tapTimes, bpmValues, averageBpmValues, averageBpm]);

  const handleReset = useCallback(() => {
    setTapTimes([]);
    setBpmValues([]);
    setAverageBpmValues([]);
    setAverageBpm(0);
    setStartTime(0);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space") {
        handleTap();
      }
      if (event.code === "KeyR" || event.code === "Escape") {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleTap, handleReset]);

  const calculateAverageBpm = (bpmValues) => {
    if (bpmValues.length === 0) return 0;
    const total = bpmValues.reduce((sum, value) => sum + value, 0);
    return (total / bpmValues.length).toFixed(2);
  };

  const calculateSmoothBpm = (bpmValues, windowSize) => {
    if (bpmValues.length < windowSize) return bpmValues;
    const smoothBpmValues = [];
    for (let i = 0; i < bpmValues.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = bpmValues.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      smoothBpmValues.push(average);
    }
    return smoothBpmValues;
  };

  const toggleDisplayMode = () => {
    setDisplayMode(displayMode === "exact" ? "average" : "exact");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const localStartTime = new Date(startTime);
    const minutes = (date.getMinutes() - localStartTime.getMinutes())
      .toString()
      .padStart(2, "0");
    const seconds = (date.getSeconds() - localStartTime.getSeconds())
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleWindowSizeChange = (event) => {
    setWindowSize(parseInt(event.target.value));
  };

  const data = {
    labels: tapTimes.map(formatTime),
    datasets: [
      {
        label: "BPM",
        data:
          displayMode === "exact"
            ? calculateSmoothBpm(bpmValues, windowSize)
            : averageBpmValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "BPM Over Time",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `BPM: ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "BPM",
        },
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
      <h2>Average BPM: {averageBpm}</h2>
      <label>
        {" "}
        Smoothness:
        <select
          value={windowSize}
          onChange={handleWindowSizeChange}
          style={{ fontSize: "1em", margin: "10px" }}
        >
          {[1, 2, 4, 6, 8, 10].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <br />
      <button
        onMouseDown={handleTap}
        style={{ fontSize: "2em", padding: "10px 20px", margin: "20px" }}
      >
        Tap
      </button>
      <button
        onClick={handleReset}
        style={{ fontSize: "2em", padding: "10px 20px" }}
      >
        Reset
      </button>

      <br />
      <button
        onClick={toggleDisplayMode}
        style={{ fontSize: "2em", padding: "10px 20px", margin: "20px" }}
      >
        Toggle to {displayMode === "exact" ? "Average BPM" : "Exact BPM"}
      </button>
    </div>
  );
};
export default BpmTracker;
