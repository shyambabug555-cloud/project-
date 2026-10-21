"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  FolderCog,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  FolderOpen,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import type { Category } from "@/lib/queries";

const emptySubscribe = () => () => {};

const PRESET_ICONS = [
  "📁", "✈️", "🌿", "💼", "📷", "🎉", "🏔️", "🏛️",
  "🎨", "🐾", "🍕", "🏖️", "💻", "🚗", "👥", "🌅",
  "🚴", "🎸", "📚", "⭐", "🏰", "☕", "⛺", "🌊"
];

type CategoryManagerDialogProps = {
  initialCategories?: Category[];
  triggerButton?: React.ReactNode;
};

export function CategoryManagerDialog({
  initialCategories,
  triggerButton,
}: CategoryManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New category form
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📁");
  const [newDescription, setNewDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit category state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        fetchCategories();
      });
    }
  }, [open]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Please provide a category name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon.trim() || "📁",
          description: newDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create category");
      }

      setCategories((prev) => [...prev, data.data]);
      setNewName("");
      setNewDescription("");
      setNewIcon("📁");
      setShowAddForm(false);
      setSuccess(`Category "${data.data.name}" created successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon || "📁");
    setEditDescription(cat.description || "");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      setError("Category name cannot be empty.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          icon: editIcon.trim(),
          description: editDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update category");
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data.data } : c)),
      );
      setEditingId(null);
      setSuccess("Category updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmDelete = window.confirm(
      `Delete category "${cat.name}"?\n\nPhotos in this category will not be deleted, they will simply be unlinked.`,
    );
    if (!confirmDelete) return;

    setDeletingId(cat.id);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setSuccess(`Category "${cat.name}" deleted.`);
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setOpen(true)}>{triggerButton}</span>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="gap-2 rounded-full border-border/80 bg-card/80 text-foreground hover:bg-accent transition text-xs sm:text-sm font-medium"
        >
          <FolderCog className="h-4 w-4 text-primary" />
          <span>Manage Categories</span>
        </Button>
      )}

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[28px] border border-border/80 bg-background text-foreground shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FolderCog className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Category Management
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Create, update, or remove categories to organize your archive
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Add category toggle / form */}
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 p-3.5 text-sm font-medium text-foreground hover:border-foreground/40 transition"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>Add New Category</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreate}
                  className="rounded-2xl border border-border/80 bg-card/80 p-4 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Create Category
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Family, Architecture, Night Sky"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/60 transition"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Icon / Emoji
                      </label>
                      <input
                        type="text"
                        value={newIcon}
                        maxLength={4}
                        onChange={(e) => setNewIcon(e.target.value)}
                        className="w-full text-center text-lg rounded-xl border border-border bg-background px-3 py-1.5 text-foreground outline-none focus:border-foreground/60 transition"
                      />
                    </div>
                  </div>

                  {/* Preset Emoji Picker */}
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1.5">
                      Or pick a suggested icon:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_ICONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewIcon(emoji)}
                          className={`h-7 w-7 rounded-lg text-sm flex items-center justify-center transition ${
                            newIcon === emoji
                              ? "bg-foreground text-background scale-110 shadow-sm"
                              : "bg-muted/40 hover:bg-muted text-foreground"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Brief note about what goes into this category"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/60 transition"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="rounded-xl border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-foreground text-background text-xs font-medium px-4 py-1.5 h-auto hover:bg-foreground/90 transition"
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Save Category
                    </Button>
                  </div>
                </form>
              )}

              {/* Categories List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Active Categories ({categories.length})
                </div>

                {loading && !categories.length ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading categories...</span>
                  </div>
                ) : !categories.length ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground rounded-2xl border border-dashed border-border/80 p-4">
                    <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs">Create your first category above.</p>
                  </div>
                ) : (
                  categories.map((cat) => {
                    const isEditing = editingId === cat.id;
                    const isDeletingThis = deletingId === cat.id;

                    if (isEditing) {
                      return (
                        <div
                          key={cat.id}
                          className="rounded-2xl border border-primary/50 bg-primary/5 p-3.5 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="sm:col-span-3">
                              <label className="text-[11px] text-muted-foreground">Category Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-foreground transition"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-muted-foreground">Icon</label>
                              <div className="flex items-center gap-1.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground overflow-hidden">
                                  <CategoryIcon icon={editIcon} className="h-4 w-4" />
                                </span>
                                <input
                                  type="text"
                                  value={editIcon}
                                  maxLength={16}
                                  onChange={(e) => setEditIcon(e.target.value)}
                                  className="w-full text-center text-xs rounded-xl border border-border bg-background px-2 py-1.5 text-foreground outline-none focus:border-foreground transition"
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1 block">Pick emoji icon:</label>
                            <div className="flex flex-wrap gap-1">
                              {PRESET_ICONS.slice(0, 12).map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setEditIcon(emoji)}
                                  className={`h-6 w-6 rounded text-xs flex items-center justify-center transition ${
                                    editIcon === emoji
                                      ? "bg-foreground text-background scale-110 shadow-sm"
                                      : "bg-muted/40 hover:bg-muted text-foreground"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground">Description</label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground transition"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                            <Button
                              type="button"
                              disabled={submitting}
                              onClick={() => handleSaveEdit(cat.id)}
                              className="rounded-lg bg-foreground text-background text-xs px-3 py-1 h-auto font-medium"
                            >
                              {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                              Update
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/60 p-3 hover:bg-card hover:border-border transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground overflow-hidden shadow-inner">
                            <CategoryIcon icon={cat.icon} className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground truncate">
                                {cat.name}
                              </h4>
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                {cat.slug}
                              </span>
                            </div>
                            {cat.description ? (
                              <p className="text-xs text-muted-foreground truncate max-w-sm">
                                {cat.description}
                              </p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground/60 italic">
                                No description
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            title="Edit Category"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isDeletingThis}
                            onClick={() => handleDelete(cat)}
                            title="Delete Category"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition"
                          >
                            {isDeletingThis ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border/80 bg-muted/20">
              <span className="text-[11px] text-muted-foreground">
                Changes take effect across the entire photo archive immediately.
              </span>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-foreground text-background text-xs px-4 py-1.5 h-auto font-medium"
              >
                Done
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
