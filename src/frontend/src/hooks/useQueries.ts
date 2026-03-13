import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { Sound } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllSounds() {
  const { actor, isFetching } = useActor();
  return useQuery<Sound[]>({
    queryKey: ["sounds"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSounds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMostPlayedSounds(limit = 5) {
  const { actor, isFetching } = useActor();
  return useQuery<Sound[]>({
    queryKey: ["mostPlayed", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMostPlayedSounds(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncrementPlayCount() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      await actor.incrementPlayCount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      queryClient.invalidateQueries({ queryKey: ["mostPlayed"] });
    },
  });
}

export function useAddSound() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      tags,
      audioBytes,
      onProgress,
    }: {
      name: string;
      description: string;
      tags: string[];
      audioBytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Actor not available");
      let blob = ExternalBlob.fromBytes(audioBytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      return actor.addSound(name, description, tags, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      queryClient.invalidateQueries({ queryKey: ["mostPlayed"] });
    },
  });
}

export function useUpdateSound() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      tags,
      audioBytes,
      onProgress,
    }: {
      id: bigint;
      name: string;
      description: string;
      tags: string[];
      audioBytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Actor not available");
      let blob = ExternalBlob.fromBytes(audioBytes);
      if (onProgress) blob = blob.withUploadProgress(onProgress);
      return actor.updateSound(id, name, description, tags, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      queryClient.invalidateQueries({ queryKey: ["mostPlayed"] });
    },
  });
}

export function useDeleteSound() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      await actor.deleteSound(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sounds"] });
      queryClient.invalidateQueries({ queryKey: ["mostPlayed"] });
    },
  });
}
