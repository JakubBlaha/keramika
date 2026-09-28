// Browser-side photo downscaling before upload (REQ-ADMIN-025).
//
// Uploads go through a Vercel function, whose request body is capped at
// 4.5 MB; phone photos are routinely larger. The site never shows a photo
// bigger than about 2000 px, so each one is scaled down to at most MAX_EDGE on
// its longer side and re-encoded as JPEG, typically a few hundred KB. This also
// strips EXIF metadata (e.g. GPS location); the orientation is applied first.
// Browser-only, like src/lib/adminApi.ts.

const MAX_EDGE = 2000;
const QUALITY = 0.85;

export async function downscaleImage(file: File): Promise<File> {
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	} catch {
		// Not decodable here (e.g. HEIC outside Safari): upload it unchanged.
		return file;
	}
	const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();

	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, 'image/jpeg', QUALITY)
	);
	if (!blob) return file;
	const name = file.name.replace(/\.[^.]*$/, '') + '.jpg';
	return new File([blob], name, { type: 'image/jpeg' });
}
