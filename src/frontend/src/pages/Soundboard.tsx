import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Music2, Search, TrendingUp, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Sound } from "../backend.d";
import SoundCard from "../components/SoundCard";
import {
  useGetAllSounds,
  useGetMostPlayedSounds,
  useIncrementPlayCount,
} from "../hooks/useQueries";

export default function Soundboard() {
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<bigint | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: allSounds = [], isLoading } = useGetAllSounds();
  const { data: mostPlayed = [] } = useGetMostPlayedSounds(5);
  const incrementPlay = useIncrementPlayCount();

  const filtered = allSounds.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const playSound = (sound: Sound, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(console.error);
    setPlayingId(sound.id);
    audio.addEventListener("ended", () => setPlayingId(null));
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingId(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Search */}
      <section className="mb-10">
        <div className="relative max-w-2xl mx-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            data-ocid="soundboard.search_input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sounds, tags..."
            className="pl-11 h-12 text-base bg-secondary border-border rounded-xl focus-visible:ring-primary"
          />
        </div>
      </section>

      {/* Most Played */}
      {!search && mostPlayed.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="font-display font-800 text-xl text-foreground">
              Most Played
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {mostPlayed.map((sound, i) => (
              <SoundCard
                key={sound.id.toString()}
                sound={sound}
                index={i}
                isPlaying={playingId === sound.id}
                onPlay={playSound}
                onStop={stopSound}
                onPlayCountIncrement={(id) => incrementPlay.mutate(id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Divider */}
      {!search && mostPlayed.length > 0 && (
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Music2 size={16} />
            <span className="text-sm font-body">All Sounds</span>
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* All Sounds Grid */}
      {isLoading ? (
        <div
          data-ocid="soundboard.loading_state"
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-muted-foreground font-body">Loading sounds...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="soundboard.empty_state"
          className="flex flex-col items-center justify-center py-24 gap-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Music2 size={32} className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-display font-700 text-lg">
            {search ? "No sounds match your search" : "No sounds yet"}
          </p>
          <p className="text-muted-foreground text-sm">
            {search
              ? "Try a different keyword"
              : "Add sounds via the Admin Panel"}
          </p>
        </div>
      ) : (
        <section>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
            initial="hidden"
            animate="visible"
          >
            {filtered.map((sound, i) => (
              <SoundCard
                key={sound.id.toString()}
                sound={sound}
                index={i}
                isPlaying={playingId === sound.id}
                onPlay={playSound}
                onStop={stopSound}
                onPlayCountIncrement={(id) => incrementPlay.mutate(id)}
              />
            ))}
          </motion.div>
        </section>
      )}
    </main>
  );
}
