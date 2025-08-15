import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// === Timeline for Loop Selection ===
const Timeline = ({ cols, loopStart, loopEnd, loopEnabled, onLoopChange, currentStep }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCol, setStartCol] = useState(null);

  const handleMouseDown = (col) => {
    setIsSelecting(true);
    setStartCol(col);
    onLoopChange(col, col);
  };

  const handleMouseEnter = (col) => {
    if (isSelecting && startCol !== null) {
      const start = Math.min(startCol, col);
      const end = Math.max(startCol, col);
      onLoopChange(start, end);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setStartCol(null);
  };

  return (
    <div style={{ display: "flex", marginBottom: 5 }}>
      <div style={{ width: 40 }}></div>
      {Array(cols).fill(0).map((_, c) => {
        const inLoop = loopEnabled && c >= loopStart && c <= loopEnd;
        const isPlayhead = c === currentStep;
        return (
          <div
            key={c}
            onMouseDown={() => handleMouseDown(c)}
            onMouseEnter={() => handleMouseEnter(c)}
            onMouseUp={handleMouseUp}
            style={{
              width: 28,
              height: 20,
              background: inLoop ? "#ff0" : "#333",
              border: "1px solid #555",
              position: "relative",
              cursor: "pointer"
            }}
          >
            {isPlayhead && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(255,0,0,0.4)",
                pointerEvents: "none"
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// === Piano Roll ===
const PianoRoll = ({ loopEnabled, loopStart, loopEnd, currentStep }) => {
  const rows = 8;
  const cols = 16;
  const [grid, setGrid] = useState(Array(rows).fill().map(() => Array(cols).fill(false)));
  const noteMap = ["C4","D4","E4","F4","G4","A4","B4","C5"];

  // Use Tone.Sampler for realistic piano
  const sampler = React.useMemo(() => 
    new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        D4: "D4.mp3",
        E4: "E4.mp3",
        F4: "F4.mp3",
        G4: "G4.mp3",
        A4: "A4.mp3",
        B4: "B4.mp3",
        C5: "C5.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination()
  , []);

  useEffect(() => {
    // Clean up previous scheduled events
    Tone.Transport.cancel();

    Tone.Transport.scheduleRepeat((time) => {
      grid.forEach((row, r) => {
        if (row[currentStep]) {
          sampler.triggerAttackRelease(noteMap[r], "8n", time);
        }
      });
    }, "8n");
  }, [grid, currentStep, sampler]);

  const toggleCell = (row, col) => {
    const copy = grid.map(r => [...r]);
    copy[row][col] = !copy[row][col];
    setGrid(copy);
  };

  return (
    <div>
      {noteMap.map((note, r) => (
        <div key={note} style={{ display: "flex" }}>
          <div style={{ width: 40, textAlign: "right", paddingRight: 5, color: "white" }}>{note}</div>
          {grid[r].map((active, c) => {
            let background = active ? "#0f0" : "#222";
            if (loopEnabled && c >= loopStart && c <= loopEnd) {
              background = active ? "#6f6" : "#333";
            }
            const isPlayhead = c === currentStep;
            return (
              <div
                key={c}
                onClick={() => toggleCell(r, c)}
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid #555",
                  background,
                  position: "relative",
                  cursor: "pointer"
                }}
              >
                {isPlayhead && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,0,0,0.4)",
                    pointerEvents: "none"
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// === Drum Grid ===
const DrumGrid = ({ loopEnabled, loopStart, loopEnd, currentStep }) => {
  const rows = 4;
  const cols = 16;
  const [grid, setGrid] = useState(Array(rows).fill().map(() => Array(cols).fill(false)));

  const drumSounds = [
    new Tone.Player("https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3").toDestination(),
    new Tone.Player("https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3").toDestination(),
    new Tone.Player("https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3").toDestination(),
    new Tone.Player("https://tonejs.github.io/audio/drum-samples/CR78/clap.mp3").toDestination(),
  ];

  useEffect(() => {
    Tone.Transport.scheduleRepeat((time) => {
      grid.forEach((row, r) => {
        if (row[currentStep]) {
          drumSounds[r].start(time);
        }
      });
    }, "8n");
  }, [grid, currentStep]);

  const toggleStep = (row, col) => {
    const copy = grid.map(r => [...r]);
    copy[row][col] = !copy[row][col];
    setGrid(copy);
  };

  return (
    <div>
      {["Kick", "Snare", "Hi-Hat", "Clap"].map((label, r) => (
        <div key={label} style={{ display: "flex" }}>
          <div style={{ width: 60, textAlign: "right", paddingRight: 5, color: "white" }}>{label}</div>
          {grid[r].map((active, c) => {
            let background = active ? "#0f0" : "#222";
            if (loopEnabled && c >= loopStart && c <= loopEnd) {
              background = active ? "#6f6" : "#333";
            }
            const isPlayhead = c === currentStep;
            return (
              <div
                key={c}
                onClick={() => toggleStep(r, c)}
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid #555",
                  background,
                  position: "relative",
                  cursor: "pointer"
                }}
              >
                {isPlayhead && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,0,0,0.4)",
                    pointerEvents: "none"
                  }} />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// === Main DAW ===
export default function DAW() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(3);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
    Tone.Transport.scheduleRepeat(() => {
      setCurrentStep(prev => {
        if (loopEnabled) {
          return prev >= loopEnd ? loopStart : prev + 1;
        }
        return (prev + 1) % 16;
      });
    }, "8n");
  }, [loopEnabled, loopStart, loopEnd, tempo]);

  const togglePlay = async () => {
    await Tone.start();
    if (isPlaying) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      setCurrentStep(0);
    } else {
      Tone.Transport.start();
    }
    setIsPlaying(!isPlaying);
  };

  const savePattern = async () => {
    await addDoc(collection(db, "patterns"), {
      date: Date.now(),
      loopEnabled, loopStart, loopEnd, tempo
    });
    alert("Pattern saved!");
  };

  const loadPatterns = async () => {
    const snap = await getDocs(collection(db, "patterns"));
    snap.forEach(doc => console.log(doc.data()));
  };

  return (
    <div style={{ padding: 20, background: "#111", minHeight: "100vh" }}>
      <h1 style={{ color: "white" }}>🎶 Web DAW</h1>
      <div style={{ marginBottom: 15 }}>
        <button onClick={togglePlay} style={{ marginRight: 10 }}>
          {isPlaying ? "Stop" : "Play"}
        </button>
        <button onClick={() => setLoopEnabled(!loopEnabled)} style={{ marginRight: 10 }}>
          {loopEnabled ? "Disable Loop" : "Enable Loop"}
        </button>
        <input
          type="number"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          style={{ width: 60, marginRight: 10 }}
        />
        BPM
        <button onClick={savePattern} style={{ marginLeft: 10 }}>Save</button>
        <button onClick={loadPatterns} style={{ marginLeft: 10 }}>Load</button>
      </div>

      <Timeline
        cols={16}
        loopStart={loopStart}
        loopEnd={loopEnd}
        loopEnabled={loopEnabled}
        currentStep={currentStep}
        onLoopChange={(start, end) => {
          setLoopStart(start);
          setLoopEnd(end);
          setLoopEnabled(true);
        }}
      />

      <h2 style={{ color: "white" }}>🎹 Piano Roll</h2>
      <PianoRoll loopEnabled={loopEnabled} loopStart={loopStart} loopEnd={loopEnd} currentStep={currentStep} />

      <h2 style={{ color: "white" }}>🥁 Drum Machine</h2>
      <DrumGrid loopEnabled={loopEnabled} loopStart={loopStart} loopEnd={loopEnd} currentStep={currentStep} />
    </div>
  );
}

