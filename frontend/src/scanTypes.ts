export interface AiScanResult {
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
