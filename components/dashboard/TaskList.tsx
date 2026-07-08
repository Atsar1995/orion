type TaskListProps = {
  tasks: string[];
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task}
          className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-colors duration-200 hover:border-white/[0.08] hover:bg-white/[0.04]"
        >
          <span
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/[0.03]"
          />
          <span className="text-sm font-light text-white/70">{task}</span>
        </li>
      ))}
    </ul>
  );
}
