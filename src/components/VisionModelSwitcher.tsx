/**
 * VisionModelSwitcher Component
 * 
 * Detects image attachments and prompts users to switch to vision-capable models
 * for optimal image analysis. Shows confirmation when already using vision models.
 */

import { Eye, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

/** Component props for vision model detection and switching */
interface VisionModelSwitcherProps {
  /** Whether current message has image attachment */
  hasImageAttachment: boolean;
  /** Currently selected model ID */
  currentModel: string;
  /** Callback to switch to vision-capable model */
  onSwitchModel: (modelId: string) => void;
}

/**
 * Vision Model Detection and Switching Interface
 * 
 * Automatically suggests vision-capable models when images are detected.
 * Shows confirmation for compatible models or upgrade options.
 */
export function VisionModelSwitcher({ hasImageAttachment, currentModel, onSwitchModel }: VisionModelSwitcherProps) {
  // Only activate when images are present
  if (!hasImageAttachment) return null;
  
  // Available vision-capable models with pricing info
  const visionModels = [
    { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash', free: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', free: false },
    { id: 'gpt-4o', name: 'GPT-4o', free: false }
  ];
  
  // Check if current model supports vision
  const isVisionModel = visionModels.some(m => m.id === currentModel);
  
  // Confirmation alert for vision-compatible models
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

  // Upgrade prompt for non-vision models
  return (
    <Alert className="mb-2 bg-purple-50 border-purple-200">
      <Eye className="h-4 w-4 text-purple-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-purple-800">
          🖼️ Image detected - Switch to vision model for better analysis
        </span>
        {/* Quick-switch buttons for vision models */}
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
