interface AssignmentPillProps {
  value: string;
  icon: React.ReactNode;
}

export const AssignmentPill = ({ value, icon }: AssignmentPillProps) => {
  const content = (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#1B3D8F]/10 px-2 py-1 text-[11px] font-medium text-[#1B3D8F] dark:bg-[#1B3D8F]/20 dark:text-[#85B7EB]">
      {icon}
      <span className="truncate max-w-20">{value}</span>
    </span>
  );
  return content;
};