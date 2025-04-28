import url from "./url";

const getSrc = (src) => {
    const isTemp = (str) => typeof str === "string" && (str.startsWith("data:image/") || str.startsWith("data:video/"));

    if (isTemp(src)) {
      return src;
    }
    return `${url.baseUrl}/${src}`;
  };

  export default getSrc