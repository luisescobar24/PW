import { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImageUrl(response.data.imageUrl);
      setError('');
      console.log('Imagen subida exitosamente a Cloudinary:', response.data.imageUrl); // <-- Agregado
    } catch (err) {
      setError('Error uploading image');
      console.error('Error al subir la imagen:', err); // <-- Opcional: muestra el error en consola
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
      {error && <p>{error}</p>}
    </div>
  );
};

export default ImageUpload;
