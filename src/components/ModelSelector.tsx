// src/components/ModelSelector.tsx

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectSeparator,
  SelectGroup, // <-- FIX: Imported SelectGroup
} from "@/components/ui/select";
import { type Model } from "@/lib/types";
import { PROVIDERS } from "@/lib/data";
import { cn } from "@/lib/utils";

import { Check, Cpu, Zap, Beaker } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// Define the props interface for the component
interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
  providerStatus: Record<string, 'ok' | 'limit_exceeded'>;
}

// Reusable component for displaying capability icons with tooltips
const CapabilityIcons = ({ capabilities }: { capabilities?: ('code' | 'fast' | 'creative')[] }) => {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {capabilities.includes('fast') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Zap size={14} className="hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="top"><p>Fast Response</p></TooltipContent>
        </Tooltip>
      )}
      {capabilities.includes('code') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Cpu size={14} className="hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="top"><p>Good at Code</p></TooltipContent>
        </Tooltip>
      )}
      {capabilities.includes('creative') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Beaker size={14} className="hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="top"><p>Creative</p></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};


export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
  providerStatus,
}: ModelSelectorProps) {
  const activeModel = models.find(m => m.id === selectedModel);
  const activeProvider = PROVIDERS.find(p => p.id === activeModel?.providerId);

  // Group models by provider for an organized list
  const groupedModels = models.reduce<Record<string, Model[]>>((acc, model) => {
    const providerName = PROVIDERS.find(p => p.id === model.providerId)?.name || 'Other';
    if (!acc[providerName]) {
      acc[providerName] = [];
    }
    acc[providerName].push(model);
    return acc;
  }, {});
  
  // Define a consistent order for providers in the list
  const providerOrder = ['OpenRouter', 'OpenAI']; 
  const sortedGroupNames = Object.keys(groupedModels).sort((a, b) => {
    const indexA = providerOrder.indexOf(a);
    const indexB = providerOrder.indexOf(b);
    if (indexA === -1) return 1; // Put unknown providers at the end
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <TooltipProvider delayDuration={300}>
      <Select
        value={selectedModel}
        onValueChange={onModelChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-auto min-w-72 h-auto flex items-center gap-3 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 p-2 border hover:bg-secondary transition-colors rounded-lg">
          <div className="flex items-center gap-3 text-left">
            <div className="text-muted-foreground">
              {/* Dynamic icon in trigger based on selected model */}
              {activeModel?.capabilities?.includes('code') ? <Cpu size={16} /> : 
               activeModel?.capabilities?.includes('creative') ? <Beaker size={16} /> :
               <Zap size={16} />}
            </div>
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
          {sortedGroupNames.map((groupName, index) => (
            <React.Fragment key={groupName}>
              {index > 0 && <SelectSeparator className="my-1" />}
              {/* FIX: Each group of items is now correctly wrapped in <SelectGroup> */}
              <SelectGroup> 
                <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {groupName}
                </SelectLabel>
                {groupedModels[groupName].map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className={cn("focus:bg-primary/10", isSelected && "bg-primary/10")}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <CapabilityIcons capabilities={model.capabilities} />
                          {providerStatus[model.providerId] === 'limit_exceeded' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                                  Limit
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right"><p>API limit reached</p></TooltipContent>
                            </Tooltip>
                          )}
                          {isSelected && <Check size={16} className="text-primary" />}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup> 
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </TooltipProvider>
  );
}