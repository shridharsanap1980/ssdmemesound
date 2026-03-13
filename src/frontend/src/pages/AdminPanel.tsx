import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  LogIn,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Sound } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddSound,
  useDeleteSound,
  useGetAllSounds,
  useIsCallerAdmin,
  useUpdateSound,
} from "../hooks/useQueries";

interface SoundForm {
  name: string;
  description: string;
  tags: string;
  audioFile: File | null;
}

const emptyForm: SoundForm = {
  name: "",
  description: "",
  tags: "",
  audioFile: null,
};

const readFileAsBytes = (file: File): Promise<Uint8Array<ArrayBuffer>> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) =>
      resolve(new Uint8Array(e.target!.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

export default function AdminPanel() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: sounds = [], isLoading: soundsLoading } = useGetAllSounds();

  const addSound = useAddSound();
  const updateSound = useUpdateSound();
  const deleteSound = useDeleteSound();

  const [addOpen, setAddOpen] = useState(false);
  const [editSound, setEditSound] = useState<Sound | null>(null);
  const [form, setForm] = useState<SoundForm>(emptyForm);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleSubmitAdd = async () => {
    if (!form.name.trim() || !form.audioFile) {
      toast.error("Name and audio file are required");
      return;
    }
    try {
      const audioBytes = await readFileAsBytes(form.audioFile);
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await addSound.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        tags,
        audioBytes,
        onProgress: setUploadProgress,
      });
      toast.success("Sound added!");
      setAddOpen(false);
      setForm(emptyForm);
      setUploadProgress(0);
    } catch {
      toast.error("Failed to add sound");
    }
  };

  const handleSubmitEdit = async () => {
    if (!editSound || !form.name.trim() || !form.audioFile) {
      toast.error("Name and new audio file are required");
      return;
    }
    try {
      const audioBytes = await readFileAsBytes(form.audioFile);
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await updateSound.mutateAsync({
        id: editSound.id,
        name: form.name.trim(),
        description: form.description.trim(),
        tags,
        audioBytes,
        onProgress: setUploadProgress,
      });
      toast.success("Sound updated!");
      setEditSound(null);
      setForm(emptyForm);
      setUploadProgress(0);
    } catch {
      toast.error("Failed to update sound");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteSound.mutateAsync(id);
      toast.success("Sound deleted");
    } catch {
      toast.error("Failed to delete sound");
    }
  };

  const openEdit = (sound: Sound) => {
    setEditSound(sound);
    setForm({
      name: sound.name,
      description: sound.description,
      tags: sound.tags.join(", "),
      audioFile: null,
    });
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
          <ShieldAlert size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="font-display font-800 text-2xl mb-2">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground">
            Login with Internet Identity to access the admin panel.
          </p>
        </div>
        <Button
          onClick={() => login()}
          disabled={loginStatus === "logging-in"}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          size="lg"
        >
          {loginStatus === "logging-in" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {loginStatus === "logging-in" ? "Logging in..." : "Login"}
        </Button>
      </main>
    );
  }

  if (adminLoading) {
    return (
      <main className="flex items-center justify-center py-24">
        <Loader2 size={40} className="animate-spin text-primary" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-destructive/20 flex items-center justify-center">
          <ShieldAlert size={36} className="text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="font-display font-800 text-2xl mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Your account does not have admin privileges.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-800 text-3xl">Admin Panel</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your meme sounds
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="admin.open_modal_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Plus size={16} /> Add Sound
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display font-800">
                  Add New Sound
                </DialogTitle>
                <DialogDescription>
                  Upload an audio file and fill in the details.
                </DialogDescription>
              </DialogHeader>
              <SoundFormFields
                form={form}
                onChange={setForm}
                fileInputRef={fileInputRef}
                uploadProgress={uploadProgress}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddOpen(false);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="admin.add_sound.submit_button"
                  onClick={handleSubmitAdd}
                  disabled={addSound.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {addSound.isPending ? (
                    <Loader2 size={14} className="animate-spin mr-2" />
                  ) : null}
                  {addSound.isPending ? "Uploading..." : "Add Sound"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleLogout} size="sm">
            Logout
          </Button>
        </div>
      </div>

      {soundsLoading ? (
        <div
          data-ocid="admin.loading_state"
          className="flex justify-center py-16"
        >
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : sounds.length === 0 ? (
        <div
          data-ocid="admin.empty_state"
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-border"
        >
          <p className="text-muted-foreground">
            No sounds yet. Add your first meme sound!
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-muted-foreground font-body font-600">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-muted-foreground font-body font-600 hidden sm:table-cell">
                  Tags
                </th>
                <th className="text-left px-5 py-3 text-muted-foreground font-body font-600 hidden md:table-cell">
                  Plays
                </th>
                <th className="text-right px-5 py-3 text-muted-foreground font-body font-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sounds.map((sound, i) => (
                <motion.tr
                  key={sound.id.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-body font-600 text-foreground">
                      {sound.name}
                    </span>
                    {sound.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {sound.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {sound.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                    {Number(sound.playCount).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog
                        open={editSound?.id === sound.id}
                        onOpenChange={(o) => {
                          if (!o) {
                            setEditSound(null);
                            setForm(emptyForm);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            data-ocid={`admin.sound.edit_button.${i + 1}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(sound)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <Pencil size={14} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-display font-800">
                              Edit Sound
                            </DialogTitle>
                            <DialogDescription>
                              Update sound details. Upload a new audio file to
                              replace.
                            </DialogDescription>
                          </DialogHeader>
                          <SoundFormFields
                            form={form}
                            onChange={setForm}
                            fileInputRef={fileInputRef}
                            uploadProgress={uploadProgress}
                            isEdit
                          />
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditSound(null);
                                setForm(emptyForm);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitEdit}
                              disabled={updateSound.isPending}
                              className="bg-primary text-primary-foreground"
                            >
                              {updateSound.isPending ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin mr-2"
                                />
                              ) : null}
                              {updateSound.isPending
                                ? "Saving..."
                                : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            data-ocid={`admin.sound.delete_button.${i + 1}`}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete "{sound.name}"?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The sound will be
                              permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sound.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

interface SoundFormFieldsProps {
  form: SoundForm;
  onChange: (f: SoundForm) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadProgress: number;
  isEdit?: boolean;
}

function SoundFormFields({
  form,
  onChange,
  fileInputRef,
  uploadProgress,
  isEdit,
}: SoundFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sound-name">Name *</Label>
        <Input
          id="sound-name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="e.g. Vine Boom"
          className="bg-secondary border-border"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sound-desc">Description</Label>
        <Textarea
          id="sound-desc"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="Short description of the sound..."
          className="bg-secondary border-border resize-none h-20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sound-tags">Tags (comma-separated)</Label>
        <Input
          id="sound-tags"
          value={form.tags}
          onChange={(e) => onChange({ ...form, tags: e.target.value })}
          placeholder="meme, funny, classic"
          className="bg-secondary border-border"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>
          {isEdit ? "Audio File (upload to replace)" : "Audio File *"}
        </Label>
        <button
          type="button"
          data-ocid="admin.dropzone"
          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          {form.audioFile ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Upload size={16} />
              <span className="text-sm font-body">{form.audioFile.name}</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <Upload size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click to upload MP3 or WAV</p>
            </div>
          )}
          <input
            data-ocid="admin.upload_button"
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/mpeg,audio/*"
            className="hidden"
            onChange={(e) =>
              onChange({ ...form, audioFile: e.target.files?.[0] ?? null })
            }
          />
        </button>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
