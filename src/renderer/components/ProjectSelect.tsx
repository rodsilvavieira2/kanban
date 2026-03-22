import * as Select from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, Check, Layers } from "lucide-react";
import { Project } from "../../shared/schemas/models";

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  projects: Project[];
}

const STATUS_DOT: Record<Project["status"], string> = {
  Planning: "var(--text-tertiary)",
  "In Progress": "var(--accent-color)",
  Completed: "var(--success)",
};

export function ProjectSelect({ value, onChange, projects }: ProjectSelectProps) {
  const selected = projects.find((p) => p.id === value);

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="project-select-trigger" aria-label="Filter by project">
        <span className="project-select-trigger-inner">
          {value === "all" ? (
            <>
              <Layers size={13} strokeWidth={2} className="project-select-icon" />
              <span>All Projects</span>
            </>
          ) : (
            <>
              <span
                className="project-select-dot"
                style={{ background: STATUS_DOT[selected?.status ?? "Planning"] }}
              />
              <span>{selected?.name ?? "Project"}</span>
            </>
          )}
        </span>
        <Select.Icon asChild>
          <ChevronDown size={13} strokeWidth={2.5} className="project-select-chevron" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="project-select-content"
          position="popper"
          sideOffset={6}
          align="end"
        >
          <Select.ScrollUpButton className="project-select-scroll-btn">
            <ChevronUp size={12} />
          </Select.ScrollUpButton>

          <Select.Viewport className="project-select-viewport">
            <Select.Item value="all" className="project-select-item">
              <Select.ItemIndicator className="project-select-indicator">
                <Check size={12} strokeWidth={2.5} />
              </Select.ItemIndicator>
              <span className="project-select-item-inner">
                <Layers size={12} strokeWidth={2} style={{ opacity: 0.6 }} />
                <Select.ItemText>All Projects</Select.ItemText>
              </span>
            </Select.Item>

            {projects.length > 0 && (
              <div className="project-select-separator" />
            )}

            {projects.map((p) => (
              <Select.Item key={p.id} value={p.id} className="project-select-item">
                <Select.ItemIndicator className="project-select-indicator">
                  <Check size={12} strokeWidth={2.5} />
                </Select.ItemIndicator>
                <span className="project-select-item-inner">
                  <span
                    className="project-select-dot"
                    style={{ background: STATUS_DOT[p.status] }}
                  />
                  <Select.ItemText>{p.name}</Select.ItemText>
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="project-select-scroll-btn">
            <ChevronDown size={12} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
