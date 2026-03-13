import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Shield, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import AdminPanel from "./pages/AdminPanel";
import Soundboard from "./pages/Soundboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

type Page = "soundboard" | "admin";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}

function AppInner() {
  const [page, setPage] = useState<Page>("soundboard");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            data-ocid="nav.link"
            onClick={() => setPage("soundboard")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Volume2 size={18} className="text-primary-foreground" />
            </div>
            <span className="font-display font-800 text-xl tracking-tight text-foreground">
              SSDMEMESOUND
            </span>
          </button>

          <nav className="flex items-center gap-2">
            <button
              type="button"
              data-ocid="nav.soundboard.tab"
              onClick={() => setPage("soundboard")}
              className={`px-4 py-2 rounded-lg text-sm font-body font-600 transition-colors ${
                page === "soundboard"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sounds
            </button>
            <button
              type="button"
              data-ocid="nav.admin.tab"
              onClick={() => setPage("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-body font-600 transition-colors flex items-center gap-1.5 ${
                page === "admin"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield size={13} />
              Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {page === "soundboard" ? <Soundboard /> : <AdminPanel />}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} SSDMEMESOUND</span>
          </div>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
