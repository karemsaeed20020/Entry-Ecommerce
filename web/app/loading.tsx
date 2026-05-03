"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">

      {/* Corner marks */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-accent" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-accent" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-primary" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-primary" />

      {/* Background blobs */}
      <div className="absolute w-[320px] h-[320px] rounded-full top-[-80px] left-[-80px] animate-pulse"
        style={{ background: "rgba(213,34,69,0.06)" }} />
      <div className="absolute w-[260px] h-[260px] rounded-full bottom-[-60px] right-[-60px] animate-pulse"
        style={{ background: "rgba(26,26,44,0.05)", animationDelay: "1s" }} />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-7">

        {/* Dual spinner */}
        <div className="relative w-[88px] h-[88px]">
          {/* track */}
          <div className="absolute inset-0 rounded-full border-[1.5px] border-border" />
          {/* outer spin — red */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-accent animate-spin"
            style={{ animationDuration: "1.1s", animationTimingFunction: "cubic-bezier(0.5,0,0.5,1)" }} />
          {/* inner spin — navy, reverse */}
          <div className="absolute inset-[6px] rounded-full border-2 border-transparent border-b-primary animate-spin"
            style={{ animationDuration: "1.8s", animationDirection: "reverse", animationTimingFunction: "cubic-bezier(0.5,0,0.5,1)" }} />
          {/* center pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center animate-pulse"
              style={{ background: "#fbe9ec" }}>
              <div className="w-[10px] h-[10px] rounded-full bg-accent" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">
            Loading...
          </h2>
          <p className="text-sm text-muted-foreground">
            Getting things ready for you
          </p>
        </div>

        {/* Sliding progress bar */}
        <div className="w-[200px] h-[2px] bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full"
            style={{ animation: "entry-progress 2s ease-in-out infinite" }} />
        </div>

        {/* Bouncing dots */}
        <div className="flex gap-[6px] items-center">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} className="w-[5px] h-[5px] rounded-full bg-accent"
              style={{ animation: `entry-dot 1.2s ease-in-out infinite`, animationDelay: `${delay}s`, opacity: 0.3 }} />
          ))}
        </div>

      </div>

      <style>{`
        @keyframes entry-progress {
          0%   { width: 0%;  margin-left: 0%; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 0%;  margin-left: 100%; }
        }
        @keyframes entry-dot {
          0%,80%,100% { opacity: 0.3; transform: scale(1); }
          40%          { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}