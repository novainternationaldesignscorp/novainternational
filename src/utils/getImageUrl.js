const DEFAULT_CLOUDINARY_CLOUD_NAME = "djgz1kays";

export const getImageUrl = (imageValue, options = "") => {
  if (!imageValue) return "/images/no-image.png";

  if (Array.isArray(imageValue)) {
    return getImageUrl(imageValue[0], options);
  }

  const normalizedValue =
    typeof imageValue === "string"
      ? imageValue
      : imageValue.images_public_id ||
        imageValue.image_public_id ||
        imageValue.public_id ||
        imageValue.secure_url ||
        imageValue.url ||
        null;

  if (!normalizedValue) return "/images/no-image.png";

  if (
    /^(https?:)?\/\//i.test(normalizedValue) ||
    normalizedValue.startsWith("/")
  ) {
    return normalizedValue;
  }

  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    import.meta.env.CLOUDINARY_CLOUD_NAME ||
    DEFAULT_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${options ? `${options}/` : ""}${normalizedValue}`;
};