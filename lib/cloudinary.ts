export function getCldImageUrl(path: string) {
  // If no cloud name is set or it's an external URL, return as is
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Clean up leading slash if any so it maps neatly to the Cloudinary public_id structure
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${cleanPath}`;
}
