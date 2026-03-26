'use client';

import { CONTENT_TYPES, TIME_SLOTS, TimeSlot } from '@/src/data/master/contentTypes';
import { IMAGE_STYLES } from '@/src/data/master/imageStyles';
import { PLATFORMS } from '@/src/data/master/platforms';
import { TONE_OF_VOICE } from '@/src/data/master/tones';
import { useGenerateStore } from '@/src/presentation/stores/useGenerateStore';
import { usePreferencesStore } from '@/src/presentation/stores/usePreferencesStore';
import { animated, config, useSpring } from '@react-spring/web';
import { useEffect, useState } from 'react';

interface GenerateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GenerateFormData) => Promise<void>;
}

export interface GenerateFormData {
  contentTypeId: string;
  timeSlot: TimeSlot;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  imageStyle: string;
  platforms: string[];
  tone: string;
}

/**
 * GenerateContentModal component
 * Modal for generating new AI content
 */
export function GenerateContentModal({ isOpen, onClose, onGenerate }: GenerateContentModalProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const initialData = useGenerateStore((state) => state.initialData);

  const { defaultTone, defaultPlatforms, defaultImageStyle, setPreference } = usePreferencesStore();
  const [brandContext, setBrandContext] = useState('');

  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [formData, setFormData] = useState<GenerateFormData>({
    contentTypeId: '',
    timeSlot: 'morning',
    topic: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    imageStyle: defaultImageStyle,
    platforms: defaultPlatforms,
    tone: defaultTone,
  });

  // Pre-fill form when modal is opening
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        scheduledDate: initialData?.scheduledDate || new Date().toISOString().split('T')[0],
        scheduledTime: initialData?.scheduledTime || '09:00',
        timeSlot: initialData?.timeSlot || 'morning',
        imageStyle: initialData?.imageStyle || defaultImageStyle,
        platforms: initialData?.platforms || defaultPlatforms,
        tone: initialData?.tone || defaultTone,
      }));

      // Hydrate brandContext to decide if we should show the UI hint
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('appSettings');
          if (stored) {
            setBrandContext(JSON.parse(stored).brandContext || '');
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, initialData, defaultTone, defaultPlatforms, defaultImageStyle]);

  const backdropSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: config.gentle,
  });

  const modalSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.9,
    y: isOpen ? 0 : 20,
    config: config.gentle,
  });

  const handleContentTypeSelect = (typeId: string) => {
    setFormData((prev) => ({ ...prev, contentTypeId: typeId }));
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!formData.contentTypeId || !formData.topic) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(formData);
      setStep(1);
      setFormData({
        contentTypeId: '',
        timeSlot: 'morning',
        topic: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        imageStyle: 'pixel-art',
        platforms: ['facebook'],
        tone: 'casual',
      });
      onClose();
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleGenerateIdea = async (e: React.MouseEvent, mode?: 'trending') => {
    // Prevent event propagation so clicking the button inside the form doesn't trigger anything else
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.contentTypeId) return;
    try {
      setIsGeneratingIdea(true);
      let ideaBrandContext = '';
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('appSettings');
          if (stored) {
            ideaBrandContext = JSON.parse(stored).brandContext || '';
          }
        } catch (err) {
          // ignore
        }
      }

      let url = `/api/ai/ideas?contentTypeId=${formData.contentTypeId}`;
      if (mode === 'trending') url += '&mode=trending';
      if (ideaBrandContext) url += `&brandContext=${encodeURIComponent(ideaBrandContext)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.success && data.idea) {
        setFormData((prev) => ({ ...prev, topic: data.idea }));
      } else {
        throw new Error(data.error || 'Failed to generate idea');
      }
    } catch (err) {
      console.error('Error generating idea:', err);
      const typeName = CONTENT_TYPES.find((c) => c.id === formData.contentTypeId)?.nameTh || '';
      setFormData((prev) => ({ ...prev, topic: `เรื่องน่าสนใจเกี่ยวกับ ${typeName}` }));
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = CONTENT_TYPES.find((t) => t.id === formData.contentTypeId);

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <animated.div
        style={modalSpring}
        className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">สร้างคอนเทนต์ใหม่</h2>
              <p className="text-xs text-muted">ขั้นตอน {step} จาก 2</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Select Content Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted mb-3">เลือกประเภทคอนเทนต์</h3>
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleContentTypeSelect(type.id)}
                  className="glass-card-hover p-4 text-left group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${type.color}20` }}
                  >
                    {type.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{type.nameTh}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{type.descriptionTh}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Configure & Generate */}
        {step === 2 && selectedType && (
          <div className="space-y-5">
            {/* Selected type */}
            <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${selectedType.color}20` }}
              >
                {selectedType.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">{selectedType.nameTh}</h4>
                <p className="text-xs text-muted">{selectedType.descriptionTh}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                เปลี่ยน
              </button>
            </div>

            {/* Topic input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">
                  หัวข้อ / ไอเดีย
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleGenerateIdea(e, 'trending')}
                    disabled={isGeneratingIdea}
                    className="text-xs flex items-center gap-1.5 font-medium bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500 hover:from-orange-500/20 hover:to-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 border border-orange-500/20"
                    title="สร้างไอเดียเกาะกระแสยอดฮิตวันนี้"
                  >
                    {isGeneratingIdea ? (
                      <span className="w-3.5 h-3.5 border-2 border-orange-400/30 border-t-orange-500 rounded-full animate-spin" />
                    ) : (
                      <span className="text-sm">🔥</span>
                    )}
                    <span>เกาะกระแส</span>
                  </button>
                  <button
                    onClick={(e) => handleGenerateIdea(e)}
                    disabled={isGeneratingIdea}
                    className="text-xs flex items-center gap-1.5 font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    title="สุ่มไอเดียทั่วไปที่เกี่ยวข้องกับหมวดหมู่นี้"
                  >
                    {isGeneratingIdea ? (
                      <span className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                    ) : (
                      <span className="text-sm">🎲</span>
                    )}
                    <span>สุ่มไอเดีย</span>
                  </button>
                </div>
              </div>
              <textarea
                value={formData.topic}
                onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="เช่น: ข่าว AI วันนี้, ก๋วยเตี๋ยวเรือ, มีมโปรแกรมเมอร์..."
                className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                rows={3}
              />
              {brandContext && (
                <div className="mt-2 flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 px-3 py-2 rounded-lg">
                  <span>💡</span>
                  <span>ระบบจะปรับไอเดียให้เข้ากับสไตล์เพจของคุณโดยอัตโนมัติ (อิงจาก Brand Persona)</span>
                </div>
              )}
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                น้ำเสียง (Tone)
              </label>
              <div className="flex gap-2 flex-wrap">
                {TONE_OF_VOICE.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, tone: t.id }));
                      setPreference('defaultTone', t.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                      formData.tone === t.id
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
                        : 'glass-card text-muted hover:text-foreground'
                    }`}
                  >
                    {t.emoji} {t.nameTh}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                แพลตฟอร์มปลายทาง
              </label>
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map((p) => {
                  const isSelected = formData.platforms.includes(p.id);
                  return (
                  <button
                    key={p.id}
                    onClick={() => setFormData((prev) => {
                      const newPlatforms = isSelected
                        ? prev.platforms.filter((id) => id !== p.id)
                        : [...prev.platforms, p.id];
                      // Ensure at least one platform is selected
                      if (newPlatforms.length === 0) return prev;
                      
                      setPreference('defaultPlatforms', newPlatforms as any[]);
                      return { ...prev, platforms: newPlatforms };
                    })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
                        : 'glass-card text-muted hover:text-foreground'
                    }`}
                  >
                    {p.emoji} {p.nameTh}
                  </button>
                )})}
              </div>
            </div>

            {/* Image Style */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                สไตล์รูปภาพ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imageStyle: style.id }));
                      setPreference('defaultImageStyle', style.id as any);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium transition-all duration-300 flex flex-col items-center gap-1 ${
                      formData.imageStyle === style.id
                        ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
                        : 'glass-card text-muted hover:text-foreground'
                    }`}
                  >
                    <span className="text-xl">{style.emoji}</span>
                    <span className="text-center">{style.nameTh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings that shouldn't persist globally but quick shortcuts are needed */}
            <div className="p-3 rounded-xl border border-violet-500/20 bg-surface/30">
              <label className="block text-sm font-medium text-foreground mb-3 flex items-center justify-between">
                <div>ช่วงเวลาโพสต์ (Schedule)</div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, scheduledDate: new Date().toISOString().split('T')[0], scheduledTime: new Date().toTimeString().slice(0,5) })) }}
                    className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors"
                  >🚀 โพสต์ทันที</button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                      setFormData(prev => ({ ...prev, scheduledDate: tomorrow.toISOString().split('T')[0], scheduledTime: '08:00', timeSlot: 'morning' }))
                    }}
                    className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
                  >🌅 เช้าพรุ่งนี้</button>
                  <button 
                    onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, scheduledTime: '12:00', timeSlot: 'lunch' })) }}
                    className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded hover:bg-orange-500/30 transition-colors"
                  >🍱 เที่ยง</button>
                  <button 
                    onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, scheduledTime: '18:00', timeSlot: 'evening' })) }}
                    className="text-[10px] bg-fuchsia-500/20 text-fuchsia-400 px-2 py-1 rounded hover:bg-fuchsia-500/30 transition-colors"
                  >🌆 เย็น</button>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border/50 bg-black/20 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border/50 bg-black/20 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl glass-card text-foreground font-medium"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.topic || isGenerating}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>กำลังสร้าง...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>สร้างคอนเทนต์</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </animated.div>
    </animated.div>
  );
}
