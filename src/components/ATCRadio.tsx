import { useState, useRef, useEffect } from "react";
import { Radio, Play, Square, Volume2, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const CHANNELS = [
    { id: "mkjs", name: "MBJ Tower", url: "https://s1-fmt2.liveatc.net/mkjs_twr" },
    { id: "mkjp", name: "KIN Tower", url: "https://s1-fmt2.liveatc.net/mkjp_app" },
];

export const ATCRadio = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
    const [volume, setVolume] = useState([50]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();

        // Add event listeners for loading state
        audioRef.current.addEventListener('waiting', () => setIsLoading(true));
        audioRef.current.addEventListener('playing', () => setIsLoading(false));

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        };
    }, []);

    // Handle changing channels or playing/stopping
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.src = activeChannel.url;
            audioRef.current.volume = volume[0] / 100;
            audioRef.current.play().catch(e => {
                console.error("Audio playback failed:", e);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
            audioRef.current.src = ""; // Clear buffer
            setIsLoading(false);
        }
    }, [isPlaying, activeChannel]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume[0] / 100;
        }
    }, [volume]);

    return (
        <div className="bg-card border border-border rounded-lg p-4 w-72 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
                <Radio className="h-4 w-4 text-accent animate-pulse-gold" />
                <h3 className="font-display font-semibold text-sm">Live ATC Radio</h3>
            </div>

            {/* Channel Selector */}
            <div className="flex gap-2 mb-4">
                {CHANNELS.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => setActiveChannel(channel)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${activeChannel.id === channel.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {channel.name}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${isPlaying ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-success/10 text-success hover:bg-success/20'
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isPlaying ? (
                        <Square className="h-4 w-4 fill-current" />
                    ) : (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                </button>

                <div className="flex-1 flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                    />
                </div>
            </div>

            {isPlaying && !isLoading && (
                <div className="mt-3 text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                    </span>
                    Streaming live {activeChannel.id.toUpperCase()}
                </div>
            )}
        </div>
    );
};
