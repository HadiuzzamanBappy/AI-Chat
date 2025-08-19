// src/components/ModelSelector.tsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { type Model } from "@/lib/types";
import { Check, Cpu, Zap, Beaker } from "lucide-react";
// UPDATED: We need to import the PROVIDERS data to get the provider names
import { PROVIDERS } from "@/lib/data";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
  providerStatus: Record<string, 'ok' | 'limit_exceeded'>;
}

export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
  providerStatus,
}: ModelSelectorProps) {
  const activeModel = models.find(m => m.id === selectedModel);
  // Find the full provider object for the active model
  const activeProvider = PROVIDERS.find(p => p.id === activeModel?.providerId);

  // NEW: A helper component to render capability icons
  const CapabilityIcons = ({ capabilities }: { capabilities: ('code' | 'fast' | 'creative')[] }) => (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {capabilities.includes('code') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Cpu size={14} />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Good at Code</p>
          </TooltipContent>
        </Tooltip>
      )}
      {capabilities.includes('fast') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Zap size={14} />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Fast Response</p>
          </TooltipContent>
        </Tooltip>
      )}
      {capabilities.includes('creative') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Beaker size={14} />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Creative</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <Select
      value={selectedModel}
      onValueChange={onModelChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto min-w-72 h-auto  flex items-center gap-3 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 p-2 border hover:bg-secondary transition-colors rounded-lg">
        {/* UPDATED: Informative Trigger with two-line layout */}
        <div className="flex items-center gap-3 text-left">
          <Cpu size={16} className="text-muted-foreground" /> 
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none text-foreground">
              {activeModel?.name || 'Select Model'}
            </span>
            <span className="text-xs text-muted-foreground leading-none mt-1">
              via {activeProvider?.name || 'Provider'}
            </span>
          </div>
        </div>
      </SelectTrigger>
    <SelectContent align="start" className="w-auto min-w-72 bg-secondary">
        {models.map((model) => {
          const provider = PROVIDERS.find(p => p.id === model.providerId);
         return (
            <SelectItem key={model.id} value={model.id}>
              {/* --- UPDATED: Refactored Layout --- */}
              <div className="flex items-center gap-3 w-full">
                {/* Left Side: Model Info */}
                <div className="flex-grow flex flex-col items-start">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {provider?.name}
                  </span>
                </div>
                
                {/* Right Side: Status Icons and Checkmark */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <CapabilityIcons capabilities={model.capabilities} />
                  {providerStatus[model.providerId] === 'limit_exceeded' && (
                    <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                      Limit
                    </span>
                  )}
                  {/* Use opacity for a cleaner show/hide of the checkmark */}
                  <Check 
                    size={16} 
                    className={`text-primary transition-opacity ${selectedModel === model.id ? 'opacity-100' : 'opacity-0'}`} 
                  />
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}