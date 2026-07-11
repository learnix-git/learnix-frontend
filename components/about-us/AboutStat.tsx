// * Accept * //

import type { ReactNode } from 'react';

interface StatCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export function StatCard({ value, label, description, icon }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur-md transition duration-300 hover:shadow-2xl hover:shadow-primary/10 dark:border-white/10 dark:bg-slate-900/70">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <div className="text-3xl font-black text-primary">{value}</div>
      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{label}</p>
      {description ? <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
  );
}