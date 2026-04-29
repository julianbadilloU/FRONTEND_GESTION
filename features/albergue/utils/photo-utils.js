import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg",
};

export async function compressPhoto(file) {
  if (!file) return null;
  if (file.size <= 1.5 * 1024 * 1024 && file.type === "image/jpeg") {
    return file;
  }
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    return file;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressAndEncodePhotos(photos, onProgress) {
  const results = [];
  for (let i = 0; i < photos.length; i++) {
    const compressed = await compressPhoto(photos[i].file);
    const base64 = await fileToBase64(compressed);
    results.push(base64);
    if (onProgress) onProgress(i + 1, photos.length);
  }
  return results;
}
