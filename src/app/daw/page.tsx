'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

import { FaPlay, FaPause } from 'react-icons/fa';
import { LuDrum, LuGuitar, LuPiano } from "react-icons/lu";
import { IoChevronDown } from "react-icons/io5";
import { BarLoader } from 'react-spinners';

// Define instrument groups and sample options
const GROUPS = [
  { groupId: 'drums', label: 'Drums', icon: <LuDrum />, options: ['Drums 1', 'Drums 2'] },
  { groupId: 'bass',  label: 'Bass',  icon: <LuGuitar />, options: ['Bass 1',  'Bass 2']  },
  { groupId: 'piano', label: 'Piano', icon: <LuPiano />, options: ['Piano 1', 'Piano 2'] },
];

// Map sample IDs to file paths
const SAMPLE_PATHS: Record<string, string> = {
  'Drums 1': '/samples/drums-1.mp3', 'Drums 2': '/samples/drums-2.mp3',
  'Bass 1':  '/samples/bass-1.mp3',  'Bass 2':  '/samples/bass-2.mp3',
  'Piano 1': '/samples/piano-1.mp3', 'Piano 2': '/samples/piano-2.mp3',
};

type SelectionState = Record<string, string>;
type ActiveState    = Record<string, boolean>;

// Visualization component: static line or animated sine wave
const Visualization: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const width = canvas.width;
    const height = canvas.height;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (!active) {
        // Draw base line only when not active
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = 'limegreen';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (active) {
        // Draw moving sine wave
        const amplitude = height / 3;
        const frequency = 0.05; // controls wave frequency
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          const y = height / 2 + Math.sin((x + offset) * frequency) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 3;
        ctx.stroke();
        offset += 7; // speed of wave movement
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [active]);

  return <canvas ref={canvasRef} width={200} height={40} className={styles.canvas} />;
};

export default function DAWPage() {
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const buffersRef    = useRef<Record<string, AudioBuffer>>({});
  const gainNodesRef  = useRef<Record<string, GainNode>>({});
  const sourcesRef    = useRef<Record<string, AudioBufferSourceNode>>({});
  const startTimeRef  = useRef<number>(0);
  const startedRef    = useRef<boolean>(false);

  // UI state: which sample is selected per group, and active (unmuted) state
  const [selected, setSelected] = useState<SelectionState>(
    GROUPS.reduce((acc, g) => ({ ...acc, [g.groupId]: g.options[0] }), {})
  );
  const [active, setActive] = useState<ActiveState>(
    GROUPS.reduce((acc, g) => ({ ...acc, [g.groupId]: false }), {})
  );
  const [loaded, setLoaded] = useState(false);

  // 1) Init AudioContext, preload buffers, create GainNodes per group
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    Promise.all(
      Object.entries(SAMPLE_PATHS).map(async ([id, path]) => {
        const resp = await fetch(path);
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffersRef.current[id] = audioBuffer;
      })
    ).then(() => {
      GROUPS.forEach(({ groupId }) => {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.connect(ctx.destination);
        gainNodesRef.current[groupId] = gain;
      });
      setLoaded(true);
    }).catch(console.error);

    return () => { ctx.close(); };
  }, []);

  // 2) Start all sources in perfect sync
  const startAll = () => {
    const ctx = audioCtxRef.current!;
    const startTime = ctx.currentTime + 0.1;
    startTimeRef.current = startTime;
    GROUPS.forEach(({ groupId }) => {
      const bufId = selected[groupId];
      const buffer = buffersRef.current[bufId];
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainNodesRef.current[groupId]);
      source.start(startTime);
      sourcesRef.current[groupId] = source;
    });
    startedRef.current = true;
  };

  // 3) Toggle mute/unmute per group
  const toggleGroup = (groupId: string) => {
    if (!startedRef.current) startAll();
    const gain = gainNodesRef.current[groupId];
    const isOn = active[groupId];
    gain.gain.setTargetAtTime(isOn ? 0 : 1, audioCtxRef.current!.currentTime, 0.01);
    setActive(a => ({ ...a, [groupId]: !isOn }));
  };

  // 4) Change sample in sync
  const handleSelect = (groupId: string, sampleId: string) => {
    setSelected(s => ({ ...s, [groupId]: sampleId }));
    if (startedRef.current) {
      const ctx = audioCtxRef.current!;
      const oldSource = sourcesRef.current[groupId];
      const elapsed = ctx.currentTime - startTimeRef.current;
      oldSource.stop();
      const buffer = buffersRef.current[sampleId];
      const newSrc = ctx.createBufferSource();
      newSrc.buffer = buffer;
      newSrc.loop = true;
      newSrc.connect(gainNodesRef.current[groupId]);
      newSrc.start(ctx.currentTime, elapsed % buffer.duration);
      sourcesRef.current[groupId] = newSrc;
    }
  };

  if (!loaded) {
    return (
      <main className={styles.container}>
        <BarLoader height={7} width={'50%'} color='#ccc' />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.grid}>
        {GROUPS.map(({ groupId, label, icon, options }) => (
          <div key={groupId} className={styles.slot}>
            <h2>{icon} {label} </h2>
            <div className={styles.sampler}>
              <div className={styles.controls}>
                <span onClick={() => toggleGroup(groupId)}>
                  {active[groupId] ? <FaPause /> : <FaPlay />}
                </span>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={selected[groupId]}
                    onChange={e => handleSelect(groupId, e.target.value)}
                  >
                    {options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <IoChevronDown className={styles.selectIcon} />
                </div>
              </div>
              <Visualization active={active[groupId]} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}