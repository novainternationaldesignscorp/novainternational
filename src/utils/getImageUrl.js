const DEFAULT_CLOUDINARY_CLOUD_NAME = "djgz1kays";

export function getImageUrl(imageValue, options = "") {
  if (!imageValue) return "/images/no-image.png";

  if (/^(https?:)?\/\//i.test(imageValue) || imageValue.startsWith("/")) {
    return imageValue;
  }

  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    import.meta.env.CLOUDINARY_CLOUD_NAME ||
    DEFAULT_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${options ? `${options}/` : ""}${imageValue}`;
}