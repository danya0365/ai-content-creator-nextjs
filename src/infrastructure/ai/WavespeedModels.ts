/**
 * WavespeedModels
 * Strict type definitions for Wavespeed AI model identifiers
 *
 * ✅ Prevents runtime "model not found" errors
 * ✅ Supports env-based model selection with type safety
 * ✅ Easy to add new models — just add to the union type + array
 *
 * Browse all models: https://wavespeed.ai/models
 */

// ============================================================
// Content / LLM Models (Text Generation)
// ============================================================

/** Wavespeed LLM models available for text/content generation */
export type WavespeedContentModel =
  | 'deepseek-ai/deepseek-v3'
  | 'deepseek-ai/deepseek-coder'
  | 'meta-llama/llama-3.1-8b-instruct'
  | 'meta-llama/llama-3.1-70b-instruct'
  | 'meta-llama/llama-3-8b-instruct'
  | 'meta-llama/llama-3-70b-instruct'
  | 'qwen/qwen-2.5-72b-instruct';

/** All valid content models (runtime array for validation) */
export const WAVESPEED_CONTENT_MODELS: WavespeedContentModel[] = [
  'deepseek-ai/deepseek-v3',
  'deepseek-ai/deepseek-coder',
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3-8b-instruct',
  'meta-llama/llama-3-70b-instruct',
  'qwen/qwen-2.5-72b-instruct',
];

/** Default content model */
export const WAVESPEED_DEFAULT_CONTENT_MODEL: WavespeedContentModel = 'deepseek-ai/deepseek-v3';

// ============================================================
// Image Models (Text-to-Image)
// ============================================================

/** Wavespeed image models available for text-to-image generation */
export type WavespeedImageModel =
  | 'wavespeed-ai/flux-schnell'
  | 'wavespeed-ai/flux-dev'
  | 'wavespeed-ai/z-image/turbo'
  | 'black-forest-labs/flux-schnell'
  | 'google/nano-banana-2/text-to-image'
  | 'google/nano-banana-pro/text-to-image'
  | 'bytedance/seedream-v4.5/edit';

/** All valid image models (runtime array for validation) */
export const WAVESPEED_IMAGE_MODELS: WavespeedImageModel[] = [
  'wavespeed-ai/flux-schnell',
  'wavespeed-ai/flux-dev',
  'wavespeed-ai/z-image/turbo',
  'black-forest-labs/flux-schnell',
  'google/nano-banana-2/text-to-image',
  'google/nano-banana-pro/text-to-image',
  'bytedance/seedream-v4.5/edit',
];

/** Default image model */
export const WAVESPEED_DEFAULT_IMAGE_MODEL: WavespeedImageModel = 'wavespeed-ai/flux-schnell';

// ============================================================
// Validation Helpers
// ============================================================

/** Type guard: check if a string is a valid Wavespeed content model */
export function isValidWavespeedContentModel(model: string): model is WavespeedContentModel {
  return WAVESPEED_CONTENT_MODELS.includes(model as WavespeedContentModel);
}

/** Type guard: check if a string is a valid Wavespeed image model */
export function isValidWavespeedImageModel(model: string): model is WavespeedImageModel {
  return WAVESPEED_IMAGE_MODELS.includes(model as WavespeedImageModel);
}

/**
 * Resolve Wavespeed content model from env or fallback
 * Reads WAVESPEED_CONTENT_MODEL from environment
 */
export function resolveWavespeedContentModel(envModel?: string): WavespeedContentModel {
  const model = envModel || process.env.WAVESPEED_CONTENT_MODEL;
  if (model && isValidWavespeedContentModel(model)) {
    return model;
  }
  if (model) {
    console.warn(
      `[WavespeedModels] Invalid content model "${model}". ` +
      `Valid options: ${WAVESPEED_CONTENT_MODELS.join(', ')}. ` +
      `Falling back to "${WAVESPEED_DEFAULT_CONTENT_MODEL}".`
    );
  }
  return WAVESPEED_DEFAULT_CONTENT_MODEL;
}

/**
 * Resolve Wavespeed image model from env or fallback
 * Reads WAVESPEED_IMAGE_MODEL from environment
 */
export function resolveWavespeedImageModel(envModel?: string): WavespeedImageModel {
  const model = envModel || process.env.WAVESPEED_IMAGE_MODEL;
  if (model && isValidWavespeedImageModel(model)) {
    return model;
  }
  if (model) {
    console.warn(
      `[WavespeedModels] Invalid image model "${model}". ` +
      `Valid options: ${WAVESPEED_IMAGE_MODELS.join(', ')}. ` +
      `Falling back to "${WAVESPEED_DEFAULT_IMAGE_MODEL}".`
    );
  }
  return WAVESPEED_DEFAULT_IMAGE_MODEL;
}
