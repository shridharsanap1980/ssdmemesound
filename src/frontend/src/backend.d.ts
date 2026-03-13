import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Sound {
    id: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    audioBlob: ExternalBlob;
    playCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSound(name: string, description: string, tags: Array<string>, audioBlob: ExternalBlob): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteSound(id: bigint): Promise<void>;
    getAllSounds(): Promise<Array<Sound>>;
    getCallerUserRole(): Promise<UserRole>;
    getMostPlayedSounds(limit: bigint): Promise<Array<Sound>>;
    getSound(id: bigint): Promise<Sound>;
    incrementPlayCount(id: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    searchSoundsByTag(tag: string): Promise<Array<Sound>>;
    searchSoundsByTags(tags: Array<string>): Promise<Array<Sound>>;
    updateAudioBlob(id: bigint, newAudioBlob: ExternalBlob): Promise<void>;
    updateSound(id: bigint, name: string, description: string, tags: Array<string>, audioBlob: ExternalBlob): Promise<void>;
}
