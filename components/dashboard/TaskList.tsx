import type { ExecutiveTask } from "@/types/intelligence";

type TaskListProps = {
  tasks: ExecutiveTask[] | string[];
};

function normalizeTasks(tasks: ExecutiveTask[] | string[]): ExecutiveTask[] {
  if (tasks.length === 0) {
    return [];
  }

  if (typeof tasks[0] === "string") {
    return (tasks as string[]).map((title, index) => ({
      id: `task-${index}`,
      title,
    }));
  }

  return tasks as ExecutiveTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  const normalizedTasks = normalizeTasks(tasks);

  return (
    <ul className="space-y-2">
      {normalizedTasks.map((task) => (
        <li
          key={task.id}
          className="flex items-start gap-3 rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-colors duration-[var(--orion-duration-normal)] hover:border-white/[0.08] hover:bg-white/[0.04]"
        >
          <span
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/[0.03]"
          />
          <span className="text-sm font-light text-white/70">{task.title}</span>
        </li>
      ))}
    </ul>
  );
}
