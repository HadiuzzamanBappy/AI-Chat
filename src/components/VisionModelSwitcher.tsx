// src/components/VisionModelSwitcher.tsx

import { Eye, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface VisionModelSwitcherProps {
  hasImageAttachment: boolean;
  currentModel: string;
  onSwitchModel: (modelId: string) => void;
}

export function VisionModelSwitcher({ hasImageAttachment, currentModel, onSwitchModel }: VisionModelSwitcherProps) {
  if (!hasImageAttachment) return null;
  
  const visionModels = [
    { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash', free: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', free: false },
    { id: 'gpt-4o', name: 'GPT-4o', free: false }
  ];
  
  const isVisionModel = visionModels.some(m => m.id === currentModel);
  
  if (isVisionModel) {
    return (
      <Alert className="mb-2 bg-primary/10 border-primary/30">
        <Eye className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          ✅ Using vision-capable model for image analysis
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-2 bg-purple-50 border-purple-200">
      <Eye className="h-4 w-4 text-purple-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-purple-800">
          🖼️ Image detected - Switch to vision model for better analysis
        </span>
        <div className="flex gap-2 ml-4">
          {visionModels.map(model => (
            <Button
              key={model.id}
              variant="outline"
              size="sm"
              onClick={() => onSwitchModel(model.id)}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {model.name}
              {model.free && <span className="ml-1 text-primary">(Free)</span>}
            </Button>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
