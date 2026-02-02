
import { supabase } from './supabase';
import { Inspection, User } from '../types';

const INSPECTIONS_TABLE = 'inspections';
const USERS_TABLE = 'users';
const PHOTOS_BUCKET = 'loco-photos';

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'Super Admin', hrmsId: 'ADMINX', password: 'password', role: 'admin' },
  { id: '2', username: 'S. Kumar', hrmsId: 'KUMARS', password: 'password', role: 'technician' },
  { id: '3', username: 'R. Singh', hrmsId: 'SINGHR', password: 'password', role: 'supervisor' }
];

export const storageService = {
  subscribeToInspections: (callback: (inspections: Inspection[]) => void) => {
    supabase.from(INSPECTIONS_TABLE)
      .select('*')
      .order('lastModified', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Error fetching inspections:", error);
        if (data) callback(data as Inspection[]);
      });

    return supabase
      .channel('public:inspections')
      .on('postgres_changes', { event: '*', schema: 'public', table: INSPECTIONS_TABLE }, async () => {
        const { data } = await supabase.from(INSPECTIONS_TABLE).select('*').order('lastModified', { ascending: false });
        if (data) callback(data as Inspection[]);
      })
      .subscribe();
  },

  subscribeToUsers: (callback: (users: User[]) => void) => {
    supabase.from(USERS_TABLE).select('*').then(async ({ data, error }) => {
      if (error) {
        console.warn("Could not connect to Supabase Users table. Check if table exists.");
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("Seeding Supabase with default users...");
        const { error: insertError } = await supabase.from(USERS_TABLE).insert(DEFAULT_USERS);
        if (insertError) console.error("Seeding failed:", insertError);
        callback(DEFAULT_USERS);
      } else {
        callback(data as User[]);
      }
    });

    return supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: USERS_TABLE }, async () => {
        const { data } = await supabase.from(USERS_TABLE).select('*');
        if (data) callback(data as User[]);
      })
      .subscribe();
  },

  saveInspection: async (inspection: Omit<Inspection, 'id'>): Promise<void> => {
    const id = Math.random().toString(36).substring(7);
    
    // 1. Upload Photo
    const base64Data = inspection.photoUrl.split(',')[1];
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    const fileName = `${id}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) {
      console.error("Storage Error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}. Did you create the '${PHOTOS_BUCKET}' bucket?`);
    }

    // 2. Get URL
    const { data: { publicUrl } } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(fileName);

    // 3. Insert Record
    const { error: dbError } = await supabase.from(INSPECTIONS_TABLE).insert({
      ...inspection,
      id,
      photoUrl: publicUrl,
      syncStatus: 'synced',
      lastModified: Date.now()
    });

    if (dbError) throw dbError;
  },

  deleteInspection: async (id: string): Promise<void> => {
    await supabase.from(INSPECTIONS_TABLE).delete().eq('id', id);
    await supabase.storage.from(PHOTOS_BUCKET).remove([`${id}.jpg`]);
  },

  saveUser: async (user: User): Promise<void> => {
    await supabase.from(USERS_TABLE).insert(user);
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<void> => {
    await supabase.from(USERS_TABLE).update(updates).eq('id', userId);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await supabase.from(USERS_TABLE).delete().eq('id', userId);
  }
};
