// import { Loader2 } from "lucide-react";

// export default function Loading() {
//   return (
//     <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm min-h-screen w-full">
//       <div className="flex flex-col items-center p-6 rounded-2xl bg-background/50 border border-border/50 shadow-sm gap-4 transition-all duration-300 animate-in fade-in zoom-in-95">
//         <div className="relative flex items-center justify-center">
//           <div className="absolute w-12 h-12 rounded-full border-4 border-primary/20 animate-pulse"></div>
//           <Loader2 className="w-10 h-10 text-primary animate-spin" />
//         </div>
//         <div className="flex flex-col items-center gap-1">
//           <h3 className="text-lg font-semibold tracking-tight text-foreground">
//             Loading...
//           </h3>
//           <p className="text-sm text-muted-foreground animate-pulse">
//             Getting things ready for you
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">

      {/* Background glow (kept but subtle) */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse bottom-[-100px] right-[-100px]" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6">

        {/* Loader ring */}
        <div className="relative w-20 h-20">

          <div className="absolute inset-0 rounded-full border border-muted" />

          {/* solid color spinner (no gradient) */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />

          {/* center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          </div>

        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Loading
          </h2>

          <p className="text-sm text-muted-foreground">
            Preparing something awesome...
          </p>
        </div>

        {/* solid progress bar (no gradient) */}
        <div className="w-56 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-blue-500 animate-pulse" />
        </div>

      </div>
    </div>
  );
}