import url from "./url";

const getSrc = (src) => {
  if (!src) return null; // ✅ safe guard

  // ✅ let local previews pass (blob: & data:)
  if (typeof src === "string" && (src.startsWith("blob:") || src.startsWith("data:"))) {
    return src;
  }

  // ✅ let absolute URLs pass (CDN, external, etc.)
  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  // ✅ otherwise treat as backend-relative path
  return `${url.baseUrl}/${src.replace(/^\/+/, "")}`;
};

export default getSrc;