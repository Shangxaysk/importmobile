// src/utils/image.ts

export const getImageUrl = (path: string | undefined | null) => {
  // 1. Agar rasm umuman yo'q bo'lsa (yoki o'chib ketgan bo'lsa)
  if (!path) return '/placeholder.png'; // yoki o'zingizda bor biron bo'sh rasm manzili

  // 2. Agar rasm ImgBB dan kelayotgan bo'lsa (http bilan boshlanadi)
  if (path.startsWith('http')) return path;

  // 3. Agar rasm eski (Render'dagi /uploads/...) bo'lsa
  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const imagePath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${imagePath}`;
};