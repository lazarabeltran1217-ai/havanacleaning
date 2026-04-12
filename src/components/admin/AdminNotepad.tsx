"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { StickyNote, X, Plus, Cloud, CloudOff, Check, Trash2, Copy } from "lucide-react";

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export function AdminNotepad() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"notes" | "checklist">("notes");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [synced, setSynced] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load on mount
  useEffect(() => {
    fetch("/api/admin/notepad")
      .then((r) => r.json())
      .then((d) => {
        setNotes(d.notes || "");
        setChecklist(d.checklist || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Auto-save with debounce
  const save = useCallback(
    (n: string, cl: ChecklistItem[]) => {
      setSynced(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/admin/notepad", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: n, checklist: cl }),
        })
          .then(() => setSynced(true))
          .catch(() => setSynced(false));
      }, 1000);
    },
    []
  );

  const handleNotesChange = (val: string) => {
    setNotes(val);
    save(val, checklist);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [...checklist, { id: Date.now().toString(), text: newTask.trim(), completed: false }];
    setChecklist(updated);
    setNewTask("");
    save(notes, updated);
  };

  const toggleTask = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    save(notes, updated);
  };

  const deleteTask = (id: string) => {
    const updated = checklist.filter((item) => item.id !== id);
    setChecklist(updated);
    save(notes, updated);
  };

  const copyToClipboard = () => {
    if (tab === "notes") {
      navigator.clipboard.writeText(notes);
    } else {
      const text = checklist
        .map((item) => `${item.completed ? "[x]" : "[ ]"} ${item.text}`)
        .join("\n");
      navigator.clipboard.writeText(text);
    }
  };

  if (!loaded) return null;

  return (
    <div className="hidden md:block">
      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-tobacco text-gold rounded-full shadow-lg hover:bg-tobacco/90 transition-colors flex items-center justify-center"
          aria-label="Open notepad"
        >
          <StickyNote className="w-5 h-5" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-80 bg-white rounded-xl shadow-2xl border border-tobacco/10 flex flex-col overflow-hidden"
          style={{ height: "380px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-tobacco/10 bg-tobacco/[0.03]">
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] font-bold tracking-[0.1em] uppercase text-tobacco">Notepad</span>
              {synced ? (
                <Cloud className="w-3.5 h-3.5 text-green" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-amber" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-tobacco/5 rounded-md transition-colors text-tobacco/50 hover:text-tobacco"
                aria-label="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-tobacco/5 rounded-md transition-colors text-tobacco/50 hover:text-tobacco"
                aria-label="Close notepad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-tobacco/10">
            <button
              onClick={() => setTab("notes")}
              className={`flex-1 py-2 text-[0.75rem] font-semibold uppercase tracking-wider transition-colors ${
                tab === "notes"
                  ? "text-green border-b-2 border-green"
                  : "text-tobacco/40 hover:text-tobacco/60"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setTab("checklist")}
              className={`flex-1 py-2 text-[0.75rem] font-semibold uppercase tracking-wider transition-colors ${
                tab === "checklist"
                  ? "text-green border-b-2 border-green"
                  : "text-tobacco/40 hover:text-tobacco/60"
              }`}
            >
              Checklist
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {tab === "notes" ? (
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Write your notes here..."
                className="w-full h-full p-4 text-[0.85rem] text-tobacco leading-relaxed resize-none focus:outline-none"
              />
            ) : (
              <div className="p-3">
                {/* Add task */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Add a task..."
                    className="flex-1 border border-tobacco/10 rounded-lg px-3 py-2 text-[0.82rem] focus:outline-none focus:ring-2 focus:ring-green/30"
                  />
                  <button
                    onClick={addTask}
                    disabled={!newTask.trim()}
                    className="w-9 h-9 bg-green text-white rounded-lg flex items-center justify-center hover:bg-green/90 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Task list */}
                {checklist.length === 0 ? (
                  <p className="text-center text-tobacco/30 text-[0.82rem] py-6">
                    No tasks yet. Add one above.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-tobacco/[0.03] transition-colors"
                      >
                        <button
                          onClick={() => toggleTask(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            item.completed
                              ? "bg-green border-green text-white"
                              : "border-tobacco/20 hover:border-green/50"
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span
                          className={`flex-1 text-[0.82rem] ${
                            item.completed ? "line-through text-tobacco/30" : "text-tobacco"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => deleteTask(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-tobacco/30 hover:text-red-500 transition-all"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
