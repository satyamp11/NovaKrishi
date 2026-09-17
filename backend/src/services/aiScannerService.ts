import { GoogleGenAI } from '@google/genai';

export interface ScanResultPayload {
  crop: string;
  disease: string;
  status: 'healthy' | 'diseased' | 'unknown';
  confidence: number;
  symptoms: string[];
  cause: string;
  treatment: string[];
  prevention: string[];
  message?: string;
}

// Detect MIME type from base64 data URI
function detectMimeType(base64Image: string): string {
  const match = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  if (match) return match[1];
  return 'image/jpeg';
}

export const aiScannerService = {
  async analyzeImage(base64Image: string, mimeType?: string): Promise<ScanResultPayload> {

    // ── DEMO MODE: bypass all real API calls ─────────────────────────────────
    if (process.env.USE_MOCK_MODE === 'true') {
      console.log('[AI Scanner] USE_MOCK_MODE=true — returning mock backend response.');
      return {
        crop: 'Demo Crop',
        disease: 'Demo Mode Active',
        status: 'unknown',
        confidence: 100,
        symptoms: ['Mock mode is enabled on the backend.'],
        cause: 'USE_MOCK_MODE=true is set in .env',
        treatment: ['Set USE_MOCK_MODE=false to enable live Gemini API'],
        prevention: [],
        message: 'Backend mock mode is active. Frontend mock results are being used for presets.'
      };
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('[AI Scanner] CRITICAL: GOOGLE_API_KEY is not set in .env');
      throw new Error('Gemini API key is not configured.');
    }
    console.log('[AI Scanner] API Key loaded OK (first 8 chars):', apiKey.substring(0, 8));

    // Detect mime type from data URI prefix
    const resolvedMimeType = detectMimeType(base64Image) || mimeType || 'image/jpeg';

    // Strip data URI prefix to get raw base64 data
    const base64Data = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    if (!base64Data || base64Data.length < 100) {
      console.error('[AI Scanner] base64 data is empty or too short, length:', base64Data.length);
      return {
        crop: 'Unknown', disease: 'Unknown', status: 'unknown', confidence: 0,
        symptoms: [], cause: '', treatment: [], prevention: [],
        message: 'Image data is invalid or too small. Please upload a clearer photo.'
      };
    }

    console.log(`[AI Scanner] Sending image to Gemini. mimeType=${resolvedMimeType}, base64Length=${base64Data.length}`);

    // ── NEW SDK: @google/genai ──────────────────────────────────────────────
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert agricultural AI assistant. Analyze this image of a plant or crop.
Your task is to identify the crop and any disease present.

STRICT RULES:
1. If the image is blurry, not a plant/leaf, or you cannot reliably identify it → return status "unknown". Do NOT guess.
2. If the plant looks healthy → return status "healthy".
3. If a disease is clearly visible → return status "diseased".
4. Return ONLY a valid JSON object. No markdown, no code fences, no extra text.

Required JSON format:
{
  "crop": "Crop Name or Unknown",
  "disease": "Disease Name or None or Unknown",
  "status": "healthy or diseased or unknown",
  "confidence": 85,
  "symptoms": ["symptom 1", "symptom 2"],
  "cause": "Cause description",
  "treatment": ["step 1", "step 2"],
  "prevention": ["tip 1", "tip 2"]
}`;

    // Try models in order — new SDK, new model names
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
    ];

    let lastError: any = null;
    let rawText: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI Scanner] Trying model: ${modelName}...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: resolvedMimeType,
                    data: base64Data,
                  }
                }
              ]
            }
          ]
        });

        rawText = response.text ?? '';
        console.log(`[AI Scanner] Success with model: ${modelName}`);
        console.log('[AI Scanner] Raw response (first 300 chars):', rawText.substring(0, 300));
        break;

      } catch (err: any) {
        console.warn(`[AI Scanner] Model ${modelName} failed:`, err?.message?.substring(0, 150));
        lastError = err;
      }
    }

    if (rawText === null) {
      // All models failed — log full error and return user-friendly message
      console.error('=== FULL GEMINI ERROR ===');
      console.error('Status:', lastError?.status || lastError?.response?.status);
      console.error('Message:', lastError?.message);
      console.error('Full error object:', JSON.stringify(lastError, Object.getOwnPropertyNames(lastError), 2));
      console.error('=========================');
      throw lastError || new Error('All Gemini models failed.');
    }

    try {
      // Strip markdown code fences if Gemini wraps in ```json ... ```
      let text = rawText.trim();
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      let parsed: ScanResultPayload;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        console.error('[AI Scanner] JSON parse failed. Raw text was:', text);
        throw new Error(`Gemini returned non-JSON response: ${text.substring(0, 200)}`);
      }

      // Validate status field
      if (!parsed.status || !['healthy', 'diseased', 'unknown'].includes(parsed.status)) {
        console.warn('[AI Scanner] Invalid status in response:', parsed.status, '→ forcing unknown');
        parsed.status = 'unknown';
      }

      if (parsed.status === 'unknown') {
        parsed.message = parsed.message || 'The image could not be clearly recognized. Please upload a clearer, well-lit photo of the affected leaf.';
      }

      console.log(`[AI Scanner] SUCCESS → crop=${parsed.crop}, disease=${parsed.disease}, status=${parsed.status}, confidence=${parsed.confidence}`);
      return parsed;

    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';
      let userMessage = 'AI analysis failed. Please try again.';

      if (msg.includes('quota') || msg.includes('rate') || msg.includes('429')) {
        userMessage = 'AI service is busy right now. Please wait a minute and try again.';
      } else if (msg.includes('invalid') || msg.includes('bad request') || msg.includes('400')) {
        userMessage = 'The image format could not be processed. Please try a JPG or PNG photo.';
      } else if (msg.includes('api key') || msg.includes('permission') || msg.includes('403')) {
        userMessage = 'AI service configuration error. Please check the API key.';
      } else if (msg.includes('json') || msg.includes('parse')) {
        userMessage = 'AI returned an unexpected response format. Please try again.';
      }

      return {
        crop: 'Unknown', disease: 'Unknown', status: 'unknown', confidence: 0,
        symptoms: [], cause: '', treatment: [], prevention: [],
        message: userMessage
      };
    }
  }
};
