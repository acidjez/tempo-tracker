import React, { useState, useEffect, useCallback, useRef } from "react";
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
import MidiWriter from "midi-writer-js";

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
  const btnRef = useRef();

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (tapTimes.length > 0) {
      const interval = (now - tapTimes[tapTimes.length - 1]) / 1000;
      const bpm = (1 / interval) * 60;
      const newBpmValues = [...bpmValues, bpm];
      setBpmValues(newBpmValues);
      setAverageBpm(calculateAverageBpm(newBpmValues));
      if (bpmValues.length > 0) {
        setAverageBpmValues([...averageBpmValues, averageBpm]);
      }
      if (bpmValues.length === 4) {
        const averageBpm = calculateAverageOfN(bpmValues, 4);
        setBpmValues((prevBpmValues) => [
          averageBpm,
          ...prevBpmValues.slice(1),
        ]);
      }
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
    btnRef.current.focus();
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
    btnRef.current.focus();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const localStartTime = new Date(startTime);
    const elapsedSeconds = Math.floor((date - localStartTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleWindowSizeChange = (event) => {
    setWindowSize(parseInt(event.target.value));
  };

  const calculateAverageOfN = (arr, n) => {
    let average = 0;
    if (arr.length < n) n = arr.length;
    for (let i = 0; i < n; i++) {
      average += arr[i];
    }
    return average / n;
  };

  const exportMidi = () => {
    const track = new MidiWriter.Track();
    const smoothBpmValues = calculateSmoothBpm(bpmValues, windowSize);

    // Set initial tempo based on the average of the first four BPM values
    const initialTempo = calculateAverageOfN(smoothBpmValues, 4);
    track.setTempo(initialTempo);

    // Add a count-in
    for (let i = 0; i < 8; i++) {
      const countInNote = new MidiWriter.NoteEvent({
        pitch: "C4",
        duration: "4",
      });
      track.addEvent(countInNote);
    }

    // Add an initial note to establish the tempo
    const initialNote = new MidiWriter.NoteEvent({
      pitch: "C4",
      duration: "4",
    });
    track.addEvent(initialNote);

    smoothBpmValues.forEach((bpm, index) => {
      const durationInSeconds =
        index === 0
          ? (tapTimes[index + 1] - tapTimes[index]) / 1000
          : (tapTimes[index] - tapTimes[index - 1]) / 1000;
      const ticks = durationInSeconds * 480; // 480 ticks per quarter note

      // Set the tempo for the current BPM
      track.setTempo(bpm, ticks);

      // Add a note event corresponding to the current BPM
      const noteEvent = new MidiWriter.NoteEvent({
        pitch: "C4",
        duration: "4",
      });
      track.addEvent(noteEvent);
    });

    const write = new MidiWriter.Writer(track);
    const midiData = write.buildFile();
    const blob = new Blob([midiData], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bpm.mid";
    link.click();
    btnRef.current.focus();
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
      <Line data={data} options={options} style={{ maxHeight: "50vh" }} />

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
        style={{
          fontSize: "2em",
          padding: "10px 20px",
          margin: "12px",
          width: "120px",
        }}
        ref={btnRef}
      >
        Tap
      </button>
      <button
        onClick={handleReset}
        style={{
          fontSize: "2em",
          padding: "10px 20px",
          margin: "12px",
          width: "120px",
        }}
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
      <br />
      <button
        onClick={exportMidi}
        style={{ fontSize: "2em", padding: "10px 20px", margin: "20px" }}
      >
        Export as MIDI
      </button>
      <p>
        MIDI is exported at your selected smoothness setting and with an 8 beat
        intro.
      </p>
    </div>
  );
};
export default BpmTracker;
