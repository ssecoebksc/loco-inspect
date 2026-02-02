
import React, { useState, useRef } from 'react';
import { ICONS } from '../constants';
import { Inspection, User } from '../types';

interface NewInspectionFormProps {
  user: User;
  onSave: (inspection: Inspection) => void;
  onCancel: () => void;
}

const NewInspectionForm: React.FC<NewInspectionFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    locoNumber: '',
    baseShed: '',
    schedule: '',
    pantographNumber: ''
  });
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Internal workflow states
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Requirement: DD/MM/YYYY and 24-Hour format
  const getFormattedTimestamp = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (reviewImage) {
      setPhoto(reviewImage);
      setReviewImage(null);
    }
  };

  const handleRetake = () => {
    setReviewImage(null);
    setPhoto(null);
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      alert('Please capture or upload a photo.');
      return;
    }

    setIsSubmitting(true);
    
    const newInspection: Inspection = {
      id: Math.random().toString(36).substring(7),
      ...formData,
      photoUrl: photo,
      timestamp: getFormattedTimestamp(),
      userId: user.id,
      syncStatus: 'pending',
      lastModified: Date.now()
    };

    // Simulate small delay for UX
    setTimeout(() => {
      onSave(newInspection);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
      {/* Capture Review Overlay */}
      {reviewImage && (
        <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-xl flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-lg aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <img src={reviewImage} alt="Raw capture" className="w-full h-full object-contain" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Review Photo</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Ensure the locomotive details are visible in the image.</p>
            </div>
          </div>
          
          <div className="max-w-md mx-auto w-full grid grid-cols-2 gap-4 pb-10">
            <button 
              type="button"
              onClick={handleRetake}
              className="py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center gap-2"
            >
              <ICONS.Camera />
              Retake
            </button>
            <button 
              type="button"
              onClick={confirmPhoto}
              className="py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <ICONS.Check />
              Confirm
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ICONS.Plus /></span>
            Loco Inspection Form
          </h2>
          <p className="text-sm text-slate-500 mt-1">Submit inspection data to cloud storage.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Loco Number</label>
              <input 
                type="text" 
                placeholder="e.g. 37210"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.locoNumber}
                onChange={e => setFormData(prev => ({...prev, locoNumber: e.target.value}))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Base Shed</label>
              <input 
                type="text" 
                placeholder="e.g. HWH"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.baseShed}
                onChange={e => setFormData(prev => ({...prev, baseShed: e.target.value}))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Schedule</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                value={formData.schedule}
                onChange={e => setFormData(prev => ({...prev, schedule: e.target.value}))}
                required
              >
                <option value="">Select Schedule</option>
                <option value="IA">IA</option>
                <option value="IB">IB</option>
                <option value="IC">IC</option>
                <option value="TI">TI (Trip Inspection)</option>
                <option value="Unschedule">Unschedule</option>
                <option value="IOH">IOH</option>
                <option value="TOH">TOH</option>
                <option value="POH">POH</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Pantograph Number</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                value={formData.pantographNumber}
                onChange={e => setFormData(prev => ({...prev, pantographNumber: e.target.value}))}
                required
              >
                <option value="">Select PT</option>
                <option value="PT1">PT1</option>
                <option value="PT2">PT2</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 block">Capture Visual Proof</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer group relative w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 overflow-hidden hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
            >
              {photo ? (
                <>
                  <img src={photo} alt="captured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ICONS.Camera />
                    <span className="text-white font-medium mt-2">Change Photo</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-mono">
                    TIMESTAMP: {getFormattedTimestamp()}
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 mx-auto mb-4 group-hover:text-indigo-500 transition-colors">
                    <ICONS.Camera />
                  </div>
                  <p className="font-bold text-slate-700">Open Camera</p>
                  <p className="text-xs text-slate-400 mt-1">Required for submission</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleCapture}
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Uploading to Drive...' : 'Save Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInspectionForm;
