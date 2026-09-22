// Verkleinert ein Foto im Browser (via Canvas) auf eine maximale
// Kantenlänge, bevor es hochgeladen wird - analog zur automatischen
// Video-Thumbnail-Erzeugung in UploadForm.tsx. Reduziert Speicherbedarf und
// Upload-Zeit bei Fotos direkt vom Handy, ohne die Bildqualität für Berichte
// spürbar zu verschlechtern.
export function bildKomprimieren(datei: File, maxKante = 1600, qualitaet = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const bild = new Image();
    bild.onload = () => {
      let { width, height } = bild;
      if (width > maxKante || height > maxKante) {
        if (width >= height) {
          height = Math.round((height / width) * maxKante);
          width = maxKante;
        } else {
          width = Math.round((width / height) * maxKante);
          height = maxKante;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas wird nicht unterstützt."));
        return;
      }
      ctx.drawImage(bild, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(bild.src);
          if (blob) resolve(blob);
          else reject(new Error("Foto konnte nicht verkleinert werden."));
        },
        "image/jpeg",
        qualitaet,
      );
    };
    bild.onerror = () => reject(new Error("Foto konnte nicht gelesen werden."));
    bild.src = URL.createObjectURL(datei);
  });
}
