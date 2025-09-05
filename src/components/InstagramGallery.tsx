import React, { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import { instagramService, InstagramPost } from '../services/instagramService';

interface InstagramGalleryProps {
  urls?: string[];
}

const InstagramGallery: React.FC<InstagramGalleryProps> = () => {
  const [isMobile, setIsMobile] = useState(false);
  // All rows from API (with flags/positions)
  const [rows, setRows] = useState<InstagramPost[]>([]);
  // Visible posts for current viewport
  const [posts, setPosts] = useState<Array<{ image: string; link: string }>>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const staticImages = [
    "/assets/1.jpeg",
    "/assets/2.jpeg", 
    "/assets/3.jpg",
    "/assets/4.jpeg"
  ];

  const imageLinks = [
    "https://www.instagram.com/p/DMAOlI6oqBj/?img_index=1",
    "https://www.instagram.com/p/DMfCoViI9oT/?img_index=1",
    "https://www.instagram.com/p/DL5FcAMI4bN/?img_index=1",
    "https://www.instagram.com/p/DNY0pVGMRaz/?img_index=1"
  ];

  // Load cached posts immediately to avoid flash
  useEffect(() => {
    try {
      const raw = localStorage.getItem('igPostsCache');
      if (raw) {
        const cached = JSON.parse(raw) as Array<{ image: string; link: string }>;
        if (Array.isArray(cached) && cached.length > 0) {
          setPosts(cached);
        }
      }
    } catch {}
  }, []);

  // Fetch all posts with flags/positions
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await instagramService.getPosts();
      if (!cancelled && Array.isArray(data)) {
        setRows(data);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Recompute visible posts when viewport or data changes
  useEffect(() => {
    const desktop = rows
      .filter(p => p.show_on_desktop)
      .sort((a, b) => (a.desktop_position ?? 0) - (b.desktop_position ?? 0))
      .slice(0, 3)
      .map(p => ({ image: p.image, link: p.link }));
    const mobile = rows
      .filter(p => p.show_on_mobile)
      .sort((a, b) => (a.mobile_position ?? 0) - (b.mobile_position ?? 0))
      .slice(0, 4)
      .map(p => ({ image: p.image, link: p.link }));
    const visible = isMobile ? mobile : desktop;
    if (visible.length > 0) {
      setPosts(visible);
      try { localStorage.setItem('igPostsCache', JSON.stringify(visible)); } catch {}
    }
  }, [rows, isMobile]);

  return (
    <div className="pt-12">
      {/* Minimalistic Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Instagram className="w-5 h-5 text-gray-600" />
          <h2 className="text-2xl font-light text-gray-800">Follow Us</h2>
        </div>
        <a 
          href="https://www.instagram.com/sseenstudios/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
        >
          @sseenstudios
        </a>
      </div>
      
      {/* Full-width Instagram Grid */}
      <div className="w-full">
        {/* Mobile: 2x2 Grid, Desktop: 3 in a row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          {/* Desktop: show 3 featured; Mobile: show 4 featured; fallback to static */}
          {posts.length > 0
            ? posts.map((p, index) => (
                <div key={index} className="relative group overflow-hidden">
                  <img 
                    src={p.image} 
                    alt="Instagram Post" 
                    className="w-full h-auto transition-opacity duration-300 group-hover:opacity-90" 
                  />
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </a>
                </div>
              ))
            : staticImages.map((imageUrl, index) => {
                if (index >= 3 && !isMobile) return null;
                const linkUrl = imageLinks[index];
                return (
                  <div key={index} className="relative group overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt="Instagram Post" 
                      className="w-full h-auto transition-opacity duration-300 group-hover:opacity-90" 
                    />
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </a>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default InstagramGallery;
