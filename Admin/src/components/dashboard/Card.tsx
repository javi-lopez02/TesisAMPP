interface Props {
  children: React.ReactNode;
  className?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}

export const Card = ({ children, className = "", title, action, onAction }: Props) => (
  <div className={`rounded-xl border border-black/[0.07] bg-white p-5 dark:border-white/[0.07] dark:bg-[#0e1a35] ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40">
        {title}
      </span>
      {action && (
        <button onClick={onAction} className="text-[11px] font-semibold text-[#1B3D8F] dark:text-[#85B7EB]">
          {action}
        </button>
      )}
    </div>
    {children}
  </div>
);

export const Separator = () => <div className="my-2 h-px bg-black/5 dark:bg-white/5" />;