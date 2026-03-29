import React, {
  useState,
  useEffect,
  use,
  Suspense,
  startTransition,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKanbanStore } from "../stores/kanbanStore";
import { TaskDetailsContent } from "./TaskDetailsContent";
import { ArrowLeft, Edit2 } from "lucide-react";
import { kanbanApi } from "../api";
import { Task } from "../../shared/schemas/models";

function ViewTaskContent({
  promise,
}: {
  promise: Promise<Task | null | undefined>;
}) {
  const task = use(promise);
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  if (!task) return <div>Task not found</div>;

  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <button
          className="btn-secondary"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            navigate(`/projects/${projectId}/tasks/${task.id}/edit`)
          }
        >
          <Edit2 size={16} /> Edit Task
        </button>
      </header>

      <TaskDetailsContent task={task} />
    </>
  );
}

export function ViewTask() {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const { loadProjectData } = useKanbanStore();

  const [taskPromise, setTaskPromise] = useState<
    Promise<Task | null | undefined>
  >(() => {
    if (projectId && taskId) {
      return kanbanApi
        .getProjectData(projectId)
        .then((res) => res.tasks.find((t) => t.id === taskId));
    }
    return Promise.resolve(null);
  });

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId, loadProjectData]);

  useEffect(() => {
    let unsubscribe: (() => void) | void;
    if (kanbanApi?.onKanbanUpdated) {
      unsubscribe = kanbanApi.onKanbanUpdated(() => {
        startTransition(() => {
          if (projectId && taskId) {
            setTaskPromise(
              kanbanApi
                .getProjectData(projectId)
                .then((res) => res.tasks.find((t) => t.id === taskId)),
            );
            loadProjectData(projectId);
          }
        });
      });
    }
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [projectId, taskId, loadProjectData]);

  return (
    <div
      className="view-task-container"
      style={{
        padding: "24px",
        width: "100%",
        maxWidth: "85%",
        margin: "0 auto",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Suspense fallback={<div>Loading task...</div>}>
        <ViewTaskContent promise={taskPromise} />
      </Suspense>
    </div>
  );
}
