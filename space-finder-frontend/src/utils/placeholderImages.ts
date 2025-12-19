// Placeholder room images from Unsplash
export const placeholderRoomImages = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540518614846-7eded47432f5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop',
];

export const getRandomPlaceholderImage = (): string => {
  return placeholderRoomImages[Math.floor(Math.random() * placeholderRoomImages.length)];
};

export const getPlaceholderImageByIndex = (index: number): string => {
  return placeholderRoomImages[index % placeholderRoomImages.length];
};