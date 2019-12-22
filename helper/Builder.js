const builder = {
  textBuilder: (message) => {
    return {
      type: "text",
      text: message
    };
  },

  imageBuilder: (previewUrl, originalUrl) => {
    return {
      type: 'image',
      originalContentUrl: originalUrl,
      previewImageUrl: previewUrl
    }
  }
}

module.exports = builder