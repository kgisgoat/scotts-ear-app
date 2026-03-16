declare module 'soundfont-player' {
  export function instrument(ac: AudioContext, name: string, options?: any): Promise<any>;
}
