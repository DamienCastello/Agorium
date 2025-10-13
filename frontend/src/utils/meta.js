export function setMetaTag(nameOrProp, content, isProperty = false) {
  // EN: Create-or-update meta tag by name or property
  const selector = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    if (isProperty) tag.setAttribute('property', nameOrProp);
    else tag.setAttribute('name', nameOrProp);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content || '');
}

export function setOgBasic({ title, description, image, url }) {
  if (title) {
    document.title = title; // title tag
    setMetaTag('og:title', title, true);
    setMetaTag('twitter:title', title);
  }
  if (description) {
    setMetaTag('description', description);
    setMetaTag('og:description', description, true);
    setMetaTag('twitter:description', description);
  }
  if (image) {
    setMetaTag('og:image', image, true);
    setMetaTag('twitter:image', image);
  }
  if (url) {
    setMetaTag('og:url', url, true);
  }
  // Keep card type to large image
  setMetaTag('twitter:card', 'summary_large_image');
}