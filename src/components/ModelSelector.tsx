import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from "@/components/ui/select";
import { type Model } from "@/lib/types";
import { PROVIDERS } from "@/lib/data";
import { cn } from "@/lib/utils";
// --- NEW ICONS IMPORTED ---
import { Check, Cpu, Zap, Beaker, Sparkles, Languages, MessageSquare } from "lucide-react";
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

// Define the expanded capabilities type
type Capability = 'code' | 'fast' | 'creative' | 'powerful' | 'chat' | 'multilingual';

// --- UPDATED COMPONENT with new icons and tooltips ---
const CapabilityIcons = ({ capabilities }: { capabilities?: Capability[] }) => {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5 text-muted-foreground">
      {capabilities.includes('powerful') && (
        <Tooltip><TooltipTrigger asChild><Sparkles size={14} className="hover:text-foreground transition-colors" /></TooltipTrigger><TooltipContent className="bg-secondary text-primary"><p>Most Powerful</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('code') && (
        <Tooltip><TooltipTrigger asChild><Cpu size={14} className="hover:text-foreground transition-colors" /></TooltipTrigger><TooltipContent className="bg-secondary text-primary"><p>Good at Code</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('creative') && (
        <Tooltip><TooltipTrigger asChild><Beaker size={14} className="hover:text-foreground transition-colors" /></TooltipTrigger><TooltipContent className="bg-secondary text-primary"><p>Creative Tasks</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('multilingual') && (
        <Tooltip><TooltipTrigger asChild><Languages size={14} className="hover:text-foreground transition-colors" /></TooltipTrigger><TooltipContent className="bg-secondary text-primary"><p>Multilingual</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('chat') && (
        <Tooltip><TooltipTrigger asChild><MessageSquare size={14} className="hover:text-foreground transition-colors" /></TooltipTrigger><TooltipContent className="bg-secondary text-primary"><p>General Chat</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('fast') && (
        <Tooltip><TooltipTrigger asChild><Zap size={14} className="hover:text-foreground transition-colors" /></TooltipTrigger><TooltipContent className="bg-secondary text-primary"><p>Fast Response</p></TooltipContent></Tooltip>
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

  const groupedModels = models.reduce<Record<string, Model[]>>((acc, model) => {
    const providerName = PROVIDERS.find(p => p.id === model.providerId)?.name || 'Other';
    if (!acc[providerName]) acc[providerName] = [];
    acc[providerName].push(model);
    return acc;
  }, {});
  
  // --- UPDATED to include Hugging Face in the sort order ---
  const providerOrder = ['OpenRouter', 'OpenAI', 'Hugging Face']; 
  const sortedGroupNames = Object.keys(groupedModels).sort((a, b) => {
    const indexA = providerOrder.indexOf(a);
    const indexB = providerOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <TooltipProvider delayDuration={300}>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
        <SelectTrigger className="w-auto min-w-60 h-auto flex items-center gap-3 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 p-2 border hover:bg-secondary transition-colors rounded-lg">
          <div className="flex items-center gap-3 text-left">
            <div className="text-muted-foreground">
              {/* --- UPDATED: Prioritized icon in trigger --- */}
              {activeModel?.capabilities?.includes('powerful') ? <Sparkles size={16} /> :
               activeModel?.capabilities?.includes('code') ? <Cpu size={16} /> : 
               activeModel?.capabilities?.includes('creative') ? <Beaker size={16} /> :
               activeModel?.capabilities?.includes('multilingual') ? <Languages size={16} /> :
               activeModel?.capabilities?.includes('chat') ? <MessageSquare size={16} /> :
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
              <SelectGroup> 
                <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {groupName}
                </SelectLabel>
                {groupedModels[groupName].map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <SelectItem key={model.id} value={model.id} className={cn("focus:bg-primary/10", isSelected && "bg-primary/10")}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{model.name}</span>
                        <div className="flex items-center gap-3 ml-4">
                          <CapabilityIcons capabilities={model.capabilities as Capability[]} />
                          {providerStatus[model.providerId] === 'limit_exceeded' && (
                            <Tooltip>
                              <TooltipTrigger asChild><span className="text-xs bg-destructive text-destructive-foreground bg-red-500 px-1.5 py-0.5 rounded-full">Limit</span></TooltipTrigger>
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