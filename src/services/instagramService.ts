// Service for managing Instagram posts via API

const API_BASE_URL = '/api';

export interface InstagramPost {
  id: string;
  image: string; // base64 or URL
  link: string;
  position: number;
  show_on_desktop?: boolean;
  desktop_position?: number | null;
  show_on_mobile?: boolean;
  mobile_position?: number | null;
}

const genId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

export const instagramService = {
  getPosts: async (): Promise<InstagramPost[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/instagram-posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('Error fetching instagram posts:', e);
      return [];
    }
  },
  addPost: async (image: string, link: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const id = genId();
      const res = await fetch(`${API_BASE_URL}/instagram-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, image, link }),
      });
      if (!res.ok) {
        const t = await res.text();
        return { ok: false, error: t };
      }
      return { ok: true };
    } catch (e) {
      console.error('Error adding instagram post:', e);
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
  deletePost: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/instagram-posts/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error('Error deleting instagram post:', e);
      return false;
    }
  },
  // Reorder featured lists per surface: surface = 'desktop' (3 items) | 'mobile' (4 items)
  reorder: async (surface: 'desktop' | 'mobile', ids: string[]): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/instagram-posts/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surface, ids }),
      });
      return res.ok;
    } catch (e) {
      console.error('Error reordering instagram posts:', e);
      return false;
    }
  },
  // Toggle a post as featured on a surface
  toggleFeatured: async (id: string, surface: 'desktop' | 'mobile', enabled: boolean): Promise<boolean> => {
    try {
      const payload: Record<string, any> = {};
      if (surface === 'desktop') {
        payload.show_on_desktop = enabled;
        if (!enabled) payload.desktop_position = null;
      } else {
        payload.show_on_mobile = enabled;
        if (!enabled) payload.mobile_position = null;
      }
      const res = await fetch(`${API_BASE_URL}/instagram-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (e) {
      console.error('Error toggling featured flag:', e);
      return false;
    }
  },
};
