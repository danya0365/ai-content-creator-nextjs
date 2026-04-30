"use client";

import { CONTENT_TYPES, TIME_SLOTS } from "@/src/data/master/contentTypes";
import {
  ASPECT_RATIOS,
  BACKGROUND_SCENES,
  COLOR_PALETTES,
  FOREGROUND_ELEMENTS,
  FRAME_STYLES,
  GLOBAL_STYLES,
  LIGHTING_STYLES,
  PHOTO_THEMES,
  PLATFORM_TARGETS,
  QUALITY_OPTIONS,
  STYLE_PRESETS,
} from "@/src/data/master/photoPromptPresets";
import {
  PhotoPromptFormData,
  usePhotoPromptStore,
} from "@/src/presentation/stores/usePhotoPromptStore";
import { animated, config, useSpring } from "@react-spring/web";
import { useCallback, useMemo, useState } from "react";

// ─── Types ───────────────────────────────────────────────────

interface GeneratePhotoPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Prompt Builder ──────────────────────────────────────────

function buildPrompt(form: PhotoPromptFormData): string {
  const theme = PHOTO_THEMES.find((t) => t.id === form.theme);
  const frame = FRAME_STYLES.find((f) => f.id === form.frameStyle);
  const bg = BACKGROUND_SCENES.find((b) => b.id === form.backgroundScene);
  const fg = FOREGROUND_ELEMENTS.find((f) => f.id === form.foreground);
  const light = LIGHTING_STYLES.find((l) => l.id === form.lighting);
  const style = GLOBAL_STYLES.find((s) => s.id === form.globalStyle);
  const palette = COLOR_PALETTES.find((c) => c.id === form.colorPalette);
  const quality = QUALITY_OPTIONS.find((q) => q.id === form.quality);
  const ratio = ASPECT_RATIOS.find((r) => r.id === form.aspectRatio);
  const platforms = form.platformTargets
    .map((id) => PLATFORM_TARGETS.find((p) => p.id === id)?.promptSnippet)
    .filter(Boolean);

  const lines: string[] = [];

  // Header
  lines.push(
    `${theme?.promptSnippet || "Islamic inspirational social media post"}, ultra high quality, emotionally powerful and highly shareable`,
  );
  lines.push("");

  // Top section
  if (form.theme === "hadith") {
    lines.push("Top section:");
    lines.push(
      'Arabic calligraphy text "قال رسول الله ﷺ", elegant and centered',
    );
  } else if (form.theme === "quran") {
    lines.push("Top section:");
    lines.push(
      'Arabic calligraphy text "بسم الله الرحمن الرحيم", elegant and centered',
    );
  } else if (form.theme === "dua") {
    lines.push("Top section:");
    lines.push(
      'Arabic calligraphy text "ادعوني أستجب لكم", elegant and centered',
    );
  }
  lines.push("");

  // Frame
  if (frame) {
    lines.push("Main focus:");
    lines.push(frame.promptSnippet);
    lines.push("");
  }

  // Arabic text
  if (form.arabicText) {
    lines.push("Inside the frame:");
    lines.push(form.arabicText);
    lines.push("");
  }

  // Source
  if (form.sourceReference) {
    lines.push("Below the frame:");
    lines.push(`Small rounded label: ${form.sourceReference}`);
    lines.push("");
  }

  // Translation
  if (form.translationText) {
    lines.push("Lower section:");
    lines.push("Thai translation with elegant typography");
    lines.push("");
    if (form.theme === "hadith") {
      lines.push('Header: "ท่านนบี ﷺ กล่าวว่า :"');
    } else if (form.theme === "quran") {
      lines.push('Header: "อัลลอฮ์ตรัสว่า :"');
    }
    lines.push(`Main quote: "${form.translationText}"`);
    lines.push("");
    lines.push("Highlight key words in green and gold tones");
    lines.push("");
  }

  // Background
  if (bg) {
    lines.push("Background:");
    lines.push(bg.promptSnippet);
    lines.push("");
  }

  // Foreground
  if (fg && fg.id !== "none") {
    lines.push("Foreground:");
    lines.push(fg.promptSnippet);
    lines.push("");
  }

  // Lighting
  if (light) {
    lines.push("Lighting:");
    lines.push(light.promptSnippet);
    lines.push("");
  }

  // Color palette
  if (palette) {
    lines.push("Color palette:");
    lines.push(palette.promptSnippet);
    lines.push("");
  }

  // Style + quality
  lines.push("Style:");
  const styleParts = [
    style?.promptSnippet,
    "premium design",
    quality?.promptSnippet,
  ].filter(Boolean);
  lines.push(styleParts.join(", "));
  lines.push("");

  // Aspect ratio
  if (ratio) {
    lines.push(`Aspect ratio: ${ratio.ratio} (${ratio.width}x${ratio.height})`);
    lines.push("");
  }

  // Platform
  if (platforms.length > 0) {
    lines.push("Additional:");
    lines.push(platforms.join(", "));
  }

  return lines.join("\n").trim();
}

// ─── Sub-components ──────────────────────────────────────────

function OptionPill({
  label,
  emoji,
  isActive,
  onClick,
}: {
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
        isActive
          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
          : "glass-card text-muted hover:text-foreground hover:bg-white/5"
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-2">
      {children}
    </label>
  );
}

// ─── Main Modal ──────────────────────────────────────────────

export function GeneratePhotoPromptModal({
  isOpen,
  onClose,
}: GeneratePhotoPromptModalProps) {
  const [step, setStep] = useState(1);
  const {
    isGenerating,
    generatedImageUrl,
    setIsGenerating,
    setGeneratedPrompt,
    setGeneratedImage,
    setError,
  } = usePhotoPromptStore();
  const [copied, setCopied] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [contentTypeId, setContentTypeId] = useState("");
  const [timeSlot, setTimeSlot] = useState("morning");

  const [form, setForm] = useState<PhotoPromptFormData>({
    theme: "",
    arabicText: "",
    translationText: "",
    sourceReference: "",
    frameStyle: "luxury-emerald",
    backgroundScene: "islamic-garden",
    foreground: "lantern-glow",
    lighting: "golden-hour",
    globalStyle: "luxury",
    colorPalette: "emerald-gold",
    aspectRatio: "1:1",
    quality: "standard",
    platformTargets: ["instagram", "facebook"],
  });

  const generatedPrompt = useMemo(() => {
    if (step === 3) return buildPrompt(form);
    return "";
  }, [form, step]);

  const updateForm = useCallback(
    <K extends keyof PhotoPromptFormData>(
      key: K,
      value: PhotoPromptFormData[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleGenerateContent = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!form.theme) return;
      setIsGeneratingContent(true);
      try {
        const response = await fetch(
          `/api/ai/photo-content?theme=${form.theme}`,
        );
        if (!response.ok) throw new Error("API error");
        const data = await response.json();
        if (data.success) {
          setForm((prev) => ({
            ...prev,
            arabicText: data.arabicText || prev.arabicText,
            translationText: data.translationText || prev.translationText,
            sourceReference: data.sourceReference || prev.sourceReference,
          }));
        } else {
          throw new Error(data.error || "Failed to generate content");
        }
      } catch (err) {
        console.error("Error generating photo content:", err);
      } finally {
        setIsGeneratingContent(false);
      }
    },
    [form.theme],
  );

  const applyPreset = useCallback((presetId: string) => {
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      frameStyle: preset.frameStyle,
      backgroundScene: preset.backgroundScene,
      foreground: preset.foreground,
      lighting: preset.lighting,
      globalStyle: preset.globalStyle,
      colorPalette: preset.colorPalette,
    }));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = generatedPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedPrompt]);

  const handleGenerateImage = useCallback(async () => {
    if (!generatedPrompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      const ratio = ASPECT_RATIOS.find((r) => r.id === form.aspectRatio);
      const response = await fetch("/api/ai/generate-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatedPrompt,
          width: ratio?.width || 1024,
          height: ratio?.height || 1024,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image");
      }
      setGeneratedPrompt(generatedPrompt);
      if (data.imageUrl) {
        // Upload external image URL to Supabase Storage for persistence
        const uploadResponse = await fetch("/api/ai/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.imageUrl }),
        });
        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok && uploadData.success && uploadData.imageUrl) {
          setGeneratedImage(uploadData.imageUrl);
        } else {
          // Fallback to the original external URL
          setGeneratedImage(data.imageUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  }, [
    generatedPrompt,
    form.aspectRatio,
    setIsGenerating,
    setError,
    setGeneratedPrompt,
    setGeneratedImage,
  ]);

  const handleSaveAsContent = useCallback(async () => {
    if (!generatedImageUrl || !contentTypeId || !timeSlot) return;
    setIsSavingContent(true);
    try {
      const title = form.translationText.substring(0, 100) || "Photo Content";
      const description =
        form.translationText +
        (form.sourceReference ? "\n\n" + form.sourceReference : "");
      const scheduledAt = new Date();
      scheduledAt.setHours(0, 0, 0, 0);

      const payload = {
        contentTypeId,
        title,
        description,
        imageUrl: generatedImageUrl,
        prompt: generatedPrompt,
        timeSlot,
        scheduledAt: scheduledAt.toISOString(),
        status: "scheduled",
      };

      const response = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save content");

      setSavedContentId(data.id || null);
    } catch (err) {
      console.error("Error saving content:", err);
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setIsSavingContent(false);
    }
  }, [
    generatedImageUrl,
    contentTypeId,
    timeSlot,
    form.translationText,
    form.sourceReference,
    generatedPrompt,
    setError,
  ]);

  const handleClose = useCallback(() => {
    setStep(1);
    setGeneratedImage("");
    setSavedContentId(null);
    setContentTypeId("");
    setTimeSlot("morning");
    onClose();
  }, [onClose, setGeneratedImage]);

  // ─── Animations ────────────────────────────────────────────

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

  if (!isOpen) return null;

  const canProceedStep1 = !!form.theme;
  const canProceedStep2 = !!form.frameStyle && !!form.backgroundScene;

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <animated.div
        style={modalSpring}
        className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl">
              🖼️
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                สร้าง Prompt รูปภาพ
              </h2>
              <p className="text-xs text-muted">ขั้นตอน {step} จาก 3</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                s <= step
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* ════════════════════════════════════════ */}
        {/* Step 1: Theme + Content                 */}
        {/* ════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Theme */}
            <div>
              <SectionLabel>🎨 เลือกธีม / วัตถุประสงค์</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PHOTO_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateForm("theme", t.id)}
                    className={`p-3 rounded-xl text-left transition-all duration-300 group ${
                      form.theme === t.id
                        ? "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                        : "glass-card-hover border border-transparent"
                    }`}
                  >
                    <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
                      {t.emoji}
                    </span>
                    <span className="text-xs font-semibold text-foreground block">
                      {t.labelTh}
                    </span>
                    {t.description && (
                      <span className="text-[10px] text-muted block mt-0.5">
                        {t.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Content Button */}
            <button
              onClick={handleGenerateContent}
              disabled={!form.theme || isGeneratingContent}
              className="w-full py-3 rounded-xl glass-card-hover text-foreground font-medium border border-emerald-500/30 hover:bg-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingContent ? (
                <>
                  <span className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-500 rounded-full animate-spin" />
                  <span>กำลังสุ่มเนื้อหา...</span>
                </>
              ) : (
                <>
                  <span>🎲</span>
                  <span>สุ่มเนื้อหาจาก AI</span>
                  {form.theme && (
                    <span className="text-xs text-muted">
                      ({PHOTO_THEMES.find((t) => t.id === form.theme)?.labelTh})
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Arabic Text */}
            <div>
              <SectionLabel>📝 ข้อความอาหรับ (Arabic Text)</SectionLabel>
              <textarea
                value={form.arabicText}
                onChange={(e) => updateForm("arabicText", e.target.value)}
                placeholder="مَنْ لَا يَرْحَمُ لَا يُرْحَمُ"
                className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-right"
                dir="rtl"
                rows={2}
              />
            </div>

            {/* Translation */}
            <div>
              <SectionLabel>🇹🇭 คำแปลภาษาไทย</SectionLabel>
              <textarea
                value={form.translationText}
                onChange={(e) => updateForm("translationText", e.target.value)}
                placeholder="ผู้ใดไม่เมตตา เขาก็จะไม่ได้รับความเมตตา"
                className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                rows={2}
              />
            </div>

            {/* Source */}
            <div>
              <SectionLabel>📚 แหล่งอ้างอิง</SectionLabel>
              <input
                type="text"
                value={form.sourceReference}
                onChange={(e) => updateForm("sourceReference", e.target.value)}
                placeholder="متفق عليه / صحيح البخاري / سورة البقرة"
                className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Next */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl glass-card text-foreground font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>ถัดไป</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* Step 2: Visual Style Options             */}
        {/* ════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Quick Presets */}
            <div>
              <SectionLabel>⚡ สไตล์ด่วน (Quick Preset)</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="px-3 py-2 rounded-xl text-xs font-medium glass-card-hover text-muted hover:text-foreground flex items-center gap-1.5 border border-white/5 hover:border-emerald-500/30 transition-all"
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.labelTh}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Frame Style */}
            <div>
              <SectionLabel>🖼️ สไตล์กรอบ (Frame)</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FRAME_STYLES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateForm("frameStyle", f.id)}
                    className={`p-2 rounded-xl text-xs font-medium transition-all duration-300 flex flex-col items-center gap-1 text-center ${
                      form.frameStyle === f.id
                        ? "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/50 text-foreground"
                        : "glass-card text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg">{f.emoji}</span>
                    <span>{f.labelTh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Scene */}
            <div>
              <SectionLabel>🏞️ ฉากหลัง (Background)</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {BACKGROUND_SCENES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateForm("backgroundScene", b.id)}
                    className={`p-2 rounded-xl text-xs font-medium transition-all duration-300 flex flex-col items-center gap-1 text-center ${
                      form.backgroundScene === b.id
                        ? "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/50 text-foreground"
                        : "glass-card text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg">{b.emoji}</span>
                    <span>{b.labelTh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Foreground */}
            <div>
              <SectionLabel>🌿 องค์ประกอบหน้า (Foreground)</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {FOREGROUND_ELEMENTS.map((f) => (
                  <OptionPill
                    key={f.id}
                    label={f.labelTh}
                    emoji={f.emoji}
                    isActive={form.foreground === f.id}
                    onClick={() => updateForm("foreground", f.id)}
                  />
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div>
              <SectionLabel>💡 แสง (Lighting)</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {LIGHTING_STYLES.map((l) => (
                  <OptionPill
                    key={l.id}
                    label={l.labelTh}
                    emoji={l.emoji}
                    isActive={form.lighting === l.id}
                    onClick={() => updateForm("lighting", l.id)}
                  />
                ))}
              </div>
            </div>

            {/* Global Style */}
            <div>
              <SectionLabel>🎭 สไตล์โดยรวม (Global Style)</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {GLOBAL_STYLES.map((s) => (
                  <OptionPill
                    key={s.id}
                    label={s.labelTh}
                    emoji={s.emoji}
                    isActive={form.globalStyle === s.id}
                    onClick={() => updateForm("globalStyle", s.id)}
                  />
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <SectionLabel>🎨 ชุดสี (Color Palette)</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COLOR_PALETTES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateForm("colorPalette", c.id)}
                    className={`p-2 rounded-xl text-xs font-medium transition-all duration-300 flex flex-col items-center gap-1.5 ${
                      form.colorPalette === c.id
                        ? "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/50 text-foreground"
                        : "glass-card text-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex gap-1">
                      {c.colors.map((color, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded-full ${color} border border-white/20`}
                        />
                      ))}
                    </div>
                    <span>{c.labelTh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl glass-card text-foreground font-medium"
              >
                ← ย้อนกลับ
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>ถัดไป</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* Step 3: Output Settings + Preview        */}
        {/* ════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Aspect Ratio */}
            <div>
              <SectionLabel>📐 สัดส่วนภาพ (Aspect Ratio)</SectionLabel>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => updateForm("aspectRatio", r.id)}
                    className={`p-3 rounded-xl text-xs font-medium transition-all duration-300 flex flex-col items-center gap-1.5 ${
                      form.aspectRatio === r.id
                        ? "bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/50 text-foreground"
                        : "glass-card text-muted hover:text-foreground"
                    }`}
                  >
                    {/* Visual ratio preview */}
                    <div
                      className={`border-2 rounded-sm ${
                        form.aspectRatio === r.id
                          ? "border-emerald-500"
                          : "border-white/20"
                      }`}
                      style={{
                        width:
                          r.id === "16:9"
                            ? 32
                            : r.id === "1:1"
                              ? 24
                              : r.id === "4:5"
                                ? 20
                                : 16,
                        height:
                          r.id === "16:9"
                            ? 18
                            : r.id === "1:1"
                              ? 24
                              : r.id === "4:5"
                                ? 25
                                : 28,
                      }}
                    />
                    <span className="font-bold">{r.label}</span>
                    <span className="text-[10px] text-muted">
                      {r.platformHint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <SectionLabel>✨ คุณภาพ (Quality)</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {QUALITY_OPTIONS.map((q) => (
                  <OptionPill
                    key={q.id}
                    label={q.labelTh}
                    emoji={q.emoji}
                    isActive={form.quality === q.id}
                    onClick={() => updateForm("quality", q.id)}
                  />
                ))}
              </div>
            </div>

            {/* Platform Target */}
            <div>
              <SectionLabel>📱 แพลตฟอร์มเป้าหมาย</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {PLATFORM_TARGETS.map((p) => {
                  const isSelected = form.platformTargets.includes(p.id);
                  return (
                    <OptionPill
                      key={p.id}
                      label={p.labelTh}
                      emoji={p.emoji}
                      isActive={isSelected}
                      onClick={() => {
                        updateForm(
                          "platformTargets",
                          isSelected
                            ? form.platformTargets.filter((id) => id !== p.id)
                            : [...form.platformTargets, p.id],
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Generated Image Preview */}
            {generatedImageUrl && (
              <div>
                <SectionLabel>🖼️ รูปที่สร้างได้</SectionLabel>
                <div className="rounded-xl overflow-hidden border border-emerald-500/20 glass-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedImageUrl}
                    alt="Generated"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Save as Content — visible after image generated */}
            {generatedImageUrl && !savedContentId && (
              <div className="space-y-3">
                <SectionLabel>💾 บันทึกเป็น Content</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  {/* Content Type */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
                      ประเภท Content
                    </label>
                    <select
                      value={contentTypeId}
                      onChange={(e) => setContentTypeId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-transparent"
                    >
                      <option value="">-- เลือก --</option>
                      {CONTENT_TYPES.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.icon} {ct.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Time Slot */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">
                      ช่วงเวลา
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-transparent"
                    >
                      {TIME_SLOTS.map((ts) => (
                        <option key={ts.id} value={ts.id}>
                          {ts.emoji} {ts.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSaveAsContent}
                  disabled={isSavingContent || !contentTypeId}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingContent ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>บันทึกเป็น Content</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Saved success banner */}
            {savedContentId && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
                ✅ บันทึก Content แล้ว
              </div>
            )}

            {/* Generated Prompt Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>📋 Prompt ที่สร้างได้</SectionLabel>
                <button
                  onClick={handleCopy}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-muted hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  <span>{copied ? "✅" : "📋"}</span>
                  <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก"}</span>
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={generatedPrompt}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-xs font-mono leading-relaxed focus:outline-none resize-none border border-emerald-500/20"
                  rows={10}
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-muted">
                  {generatedPrompt.length} chars
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-xl glass-card text-foreground font-medium"
              >
                ← ย้อนกลับ
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 py-3 rounded-xl glass-card text-foreground font-semibold border border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
              >
                <span>{copied ? "✅" : "📋"}</span>
                <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก Prompt"}</span>
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating || !generatedPrompt}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>กำลังสร้าง...</span>
                  </>
                ) : (
                  <>
                    <span>🖼️</span>
                    <span>สร้างรูป</span>
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
