export default function extractVideoId(url) {
  try {
      const parsedUrl = new URL(url);
      
      // Cas des liens youtube.com (watch, embed, etc.)
      if (parsedUrl.hostname.includes('youtube.com')) {
          // Exemples d'URLs: /watch?v=ID, /embed/ID
          if (parsedUrl.pathname === '/watch') {
              return parsedUrl.searchParams.get('v');
          } else if (parsedUrl.pathname.startsWith('/embed/')) {
              return parsedUrl.pathname.split('/embed/')[1].split('/')[0];
          } else if (parsedUrl.pathname.startsWith('/v/')) {
              return parsedUrl.pathname.split('/v/')[1].split('/')[0];
          }
      }
      
      // Cas des liens youtu.be
      if (parsedUrl.hostname.includes('youtu.be')) {
          return parsedUrl.pathname.slice(1);
      }
  } catch (err) {
      // Si ce n'est pas une URL valide
      console.error('Invalid URL', err);
  }

  return false;
}
  /*
  // Example of use
  const url1 = "https://www.youtube.com/watch?v=U3tqI9Sf5yU";
  const url2 = "https://youtu.be/U3tqI9Sf5yU";
  const url3 = "https://www.youtube.com/embed/U3tqI9Sf5yU";
  const url4 = "https://www.youtube.com/watch?v=U3tqI9Sf5yU&feature=youtu.be";
  
  console.log(extractVideoId(url1));  // "U3tqI9Sf5yU"
  console.log(extractVideoId(url2));  // "U3tqI9Sf5yU"
  console.log(extractVideoId(url3));  // "U3tqI9Sf5yU"
  console.log(extractVideoId(url4));  // "U3tqI9Sf5yU"
  */