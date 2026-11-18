// Local Vite has no Lovable asset proxy; use the project's asset-serving origin there.
export function assetUrl(path: string, local = import.meta.env.DEV) {
  return local && path.startsWith('/__l5e/assets-v1/')
    ? `https://learnspace-learning-hub.lovable.app${path}`
    : path;
}