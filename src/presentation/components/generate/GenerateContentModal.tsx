'use client';

import { CONTENT_TYPES, TIME_SLOTS, TimeSlot } from '@/src/data/master/contentTypes';
import { animated, config, useSpring } from '@react-spring/web';
import { useState } from 'react';

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
}

/**
 * GenerateContentModal component
 * Modal for generating new AI content
 */
export function GenerateContentModal({ isOpen, onClose, onGenerate }: GenerateContentModalProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<GenerateFormData>({
    contentTypeId: '',
    timeSlot: 'morning',
    topic: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
  });

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
              <label className="block text-sm font-medium text-foreground mb-2">
                หัวข้อ / ไอเดีย
              </label>
              <textarea
                value={formData.topic}
                onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="เช่น: ข่าว AI วันนี้, ก๋วยเตี๋ยวเรือ, มีมโปรแกรมเมอร์..."
                className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                rows={3}
              />
            </div>

            {/* Time slot */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ช่วงเวลาโพสต์
              </label>
              <div className="flex gap-2 flex-wrap">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setFormData((prev) => ({ ...prev, timeSlot: slot.id }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      formData.timeSlot === slot.id
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
                        : 'glass-card text-muted hover:text-foreground'
                    }`}
                  >
                    {slot.emoji} {slot.nameTh}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  วันที่
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  เวลา
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
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
