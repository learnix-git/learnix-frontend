// * Accept * //

import type { ReactNode } from 'react';

interface FeaturePillProps {
  icon: ReactNode;
  title: string;
  copy: string;
}

export function FeaturePill({ icon, title, copy }: FeaturePillProps) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md transition hover:border-primary/30 dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy}</p>
        </div>
      </div>
    </div>
  );
}