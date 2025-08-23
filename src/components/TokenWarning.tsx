/**
 * TokenWarning Component
 * 
 * Displays contextual alerts when conversations approach or exceed model token limits.
 * Provides model switching recommendations to maintain conversation continuity.
 */

import { AlertTriangle, Zap } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

/** Component props for token limit monitoring and model recommendations */
interface TokenWarningProps {
  /** Current conversation token count */
  currentTokens: number;
  /** Model's maximum token limit */
  tokenLimit: number;
  /** Current model display name */
  modelName: string;
  /** Callback to switch to different model */
  onSwitchModel?: (modelId: string) => void;
  /** Recommended model with higher token capacity */
  recommendedModel?: {
    id: string;
    name: string;
    limit: number;
  };
}

/**
 * Token Limit Alert System
 * 
 * Shows warnings at 80% capacity and errors when limit exceeded.
 * Automatically trims conversations and suggests model upgrades.
 */
export function TokenWarning({ 
  currentTokens, 
  tokenLimit, 
  modelName, 
  onSwitchModel,
  recommendedModel 
}: TokenWarningProps) {
  // Calculate warning thresholds
  const isOverLimit = currentTokens > tokenLimit;
  const isNearLimit = currentTokens > tokenLimit * 0.8;

  // Only show alert when approaching or exceeding limits
  if (!isNearLimit) return null;

  return (
    <Alert className={`mb-4 ${isOverLimit ? 'border-red-500 bg-red-50' : 'border-purple-500 bg-purple-50'}`}>
      <AlertTriangle className={`h-4 w-4 ${isOverLimit ? 'text-red-600' : 'text-purple-600'}`} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          {/* Alert status and token usage information */}
          <div className={`font-medium ${isOverLimit ? 'text-red-800' : 'text-purple-800'}`}>
            {isOverLimit ? 'Token Limit Exceeded' : 'Approaching Token Limit'}
          </div>
          <div className={`text-sm ${isOverLimit ? 'text-red-600' : 'text-purple-600'}`}>
            Using ~{currentTokens.toLocaleString()} tokens of {tokenLimit.toLocaleString()} limit for {modelName}
          </div>
          {/* Auto-trimming notification for exceeded limits */}
          {isOverLimit && (
            <div className="text-sm text-red-600 mt-1">
              Your conversation will be automatically trimmed to fit within the limit.
            </div>
          )}
        </div>
        
        {/* Model upgrade suggestion button */}
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
