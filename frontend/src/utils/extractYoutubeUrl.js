export default function extractVideoId(url) {
    // Regex to capture YouTube video IDs in different formats
    const youtubeRegex = /(?:https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|(?:v|e(?:mbed)?)\/|\S+?\/)|youtu\.be\/))([\w\-]{11})/;
    
    const match = url.match(youtubeRegex);
    
    // If a match is found, returns the video ID
    if (match && match[1]) {
      return match[1];
    }
    
    // If no ID is found, returns false
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