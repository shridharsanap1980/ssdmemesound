import { Music, Play, Square } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Sound } from "../backend.d";

const CARD_COLORS = [
  {
    bg: "oklch(0.88 0.22 110)",
    text: "oklch(0.1 0.02 260)",
    glow: "0.88 0.22 110",
  },
  {
    bg: "oklch(0.65 0.28 350)",
    text: "oklch(0.98 0.01 90)",
    glow: "0.65 0.28 350",
  },
  {
    bg: "oklch(0.75 0.22 200)",
    text: "oklch(0.1 0.02 260)",
    glow: "0.75 0.22 200",
  },
  {
    bg: "oklch(0.8 0.22 60)",
    text: "oklch(0.1 0.02 260)",
    glow: "0.8 0.22 60",
  },
  {
    bg: "oklch(0.75 0.2 145)",
    text: "oklch(0.1 0.02 260)",
    glow: "0.75 0.2 145",
  },
  {
    bg: "oklch(0.7 0.2 290)",
    text: "oklch(0.98 0.01 90)",
    glow: "0.7 0.2 290",
  },
];

const BAR_HEIGHTS: { key: string; h: string }[] = [
  { key: "bar-a", h: "60%" },
  { key: "bar-b", h: "100%" },
  { key: "bar-c", h: "40%" },
  { key: "bar-d", h: "80%" },
];

interface SoundCardProps {
  sound: Sound;
  index: number;
  isPlaying: boolean;
  onPlay: (sound: Sound, audioUrl: string) => void;
  onStop: () => void;
  onPlayCountIncrement: (id: bigint) => void;
}

export default function SoundCard({
  sound,
  index,
  isPlaying,
  onPlay,
  onStop,
  onPlayCountIncrement,
}: SoundCardProps) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = sound.audioBlob.getDirectURL();
  }, [sound.audioBlob]);

  const handleClick = () => {
    if (isPlaying) {
      onStop();
    } else {
      const url = audioUrlRef.current || sound.audioBlob.getDirectURL();
      onPlay(sound, url);
      onPlayCountIncrement(sound.id);
    }
  };

  return (
    <motion.div
      data-ocid={`soundboard.card.item.${index + 1}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.3 }}
      className="sound-card-glow rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{ "--glow-color": color.glow } as React.CSSProperties}
      onClick={handleClick}
    >
      <div
        className="flex flex-col gap-3 p-5 h-full min-h-[160px]"
        style={{ backgroundColor: color.bg }}
      >
        {/* Top row: playing indicator */}
        <div className="flex items-center justify-between">
          {isPlaying ? (
            <div className="flex items-end gap-[3px] h-5">
              {BAR_HEIGHTS.map(({ key, h }) => (
                <div
                  key={key}
                  className="playing-bar w-[4px] rounded-full origin-bottom"
                  style={{ height: h, backgroundColor: color.text }}
                />
              ))}
            </div>
          ) : (
            <Music size={16} style={{ color: color.text, opacity: 0.5 }} />
          )}
          <span
            className="text-xs font-bold opacity-60"
            style={{ color: color.text }}
          >
            ▶ {Number(sound.playCount).toLocaleString()}
          </span>
        </div>

        {/* Sound name */}
        <div className="flex-1">
          <h3
            className="font-display font-700 text-base leading-tight line-clamp-2"
            style={{ color: color.text }}
          >
            {sound.name}
          </h3>
        </div>

        {/* Tags + Play button row */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {sound.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full opacity-70"
                style={{
                  backgroundColor: `${color.text}22`,
                  color: color.text,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <motion.button
            type="button"
            data-ocid={`soundboard.card.play_button.${index + 1}`}
            whileTap={{ scale: 0.9 }}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
              isPlaying ? "play-btn-pulse" : ""
            }`}
            style={
              {
                backgroundColor: color.text,
                color: color.bg,
                "--glow-color": color.glow,
              } as React.CSSProperties
            }
            aria-label={isPlaying ? `Stop ${sound.name}` : `Play ${sound.name}`}
          >
            {isPlaying ? (
              <Square size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
