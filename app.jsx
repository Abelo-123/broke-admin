import React, { useState } from 'react';
import './index.css';

function App() {
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="w-12/12 max-h-64 h-24 bg-red-300 p-3 flex place-content-center grid cursor-pointer"
      onClick={() => document.getElementById('imageInput').click()}
    >
      {image ? (
        <img src={image} alt="Selected" className="max-h-full max-w-full object-contain" />
      ) : (
        'Your Image'
      )}
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
    </div>
  );
}

export default App;
