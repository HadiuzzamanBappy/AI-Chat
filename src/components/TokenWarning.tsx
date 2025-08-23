// src/components/TokenWarning.tsx

import { AlertTriangle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface TokenWarningProps {
  currentTokens: number;
  tokenLimit: number;
  modelName: string;
  onSwitchModel?: (modelId: string) => void;
  recommendedModel?: {
    id: string;
    name: string;
    limit: number;
  };
}

export function TokenWarning({ 
  currentTokens, 
  tokenLimit, 
  modelName, 
  onSwitchModel,
  recommendedModel 
}: TokenWarningProps) {
  const isOverLimit = currentTokens > tokenLimit;
  const isNearLimit = currentTokens > tokenLimit * 0.8;

  if (!isNearLimit) return null;

  return (
    <Alert className={`mb-4 ${isOverLimit ? 'border-red-500 bg-red-50' : 'border-purple-500 bg-purple-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isOverLimit ? 'text-red-600' : 'text-purple-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className={`font-medium ${isOverLimit ? 'text-red-800' : 'text-purple-800'}`}>
            {isOverLimit ? 'Token Limit Exceeded' : 'Approaching Token Limit'}
          </div>
          <div className={`text-sm ${isOverLimit ? 'text-red-600' : 'text-purple-600'}`}>
            Using ~{currentTokens.toLocaleString()} tokens of {tokenLimit.toLocaleString()} limit for {modelName}
          </div>
          {isOverLimit && (
            <div className="text-sm text-red-600 mt-1">
              Your conversation will be automatically trimmed to fit within the limit.
            </div>
          )}
        </div>
        
        {recommendedModel && onSwitchModel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSwitchModel(recommendedModel.id)}
            className="ml-4 whitespace-nowrap"
          >
            <Zap className="w-4 h-4 mr-2" />
            Switch to {recommendedModel.name}
            <span className="text-xs ml-1">
              ({recommendedModel.limit.toLocaleString()} tokens)
            </span>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
