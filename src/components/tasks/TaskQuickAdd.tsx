import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function TaskQuickAdd({ date }: { date?: string }) {
  const [text, setText] = useState("");
  const quickAddTask = useAppStore((state) => state.quickAddTask);

  const submit = async () => {
    if (!text.trim()) return;
    await quickAddTask(text, date);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void submit();
        }}
        placeholder="Finish lab report tomorrow high 3p #university"
      />
      <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => void submit()}>
        Add
      </Button>
    </div>
  );
}
