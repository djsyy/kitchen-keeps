import type { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-text-950">{title}</h2>
        <p className="text-sm text-text-500">{description}</p>
      </div>
      {actions}
    </div>
  );
}
