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
import { Cpu, Zap, Beaker, Sparkles, Languages, MessageSquare } from "lucide-react";
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
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {capabilities.includes('powerful') && (
        <Tooltip><TooltipTrigger asChild><Sparkles size={12} className="hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent className="bg-popover border shadow-md"><p>Most Powerful</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('code') && (
        <Tooltip><TooltipTrigger asChild><Cpu size={12} className="hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent className="bg-popover border shadow-md"><p>Good at Code</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('creative') && (
        <Tooltip><TooltipTrigger asChild><Beaker size={12} className="hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent className="bg-popover border shadow-md"><p>Creative Tasks</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('multilingual') && (
        <Tooltip><TooltipTrigger asChild><Languages size={12} className="hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent className="bg-popover border shadow-md"><p>Multilingual</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('chat') && (
        <Tooltip><TooltipTrigger asChild><MessageSquare size={12} className="hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent className="bg-popover border shadow-md"><p>General Chat</p></TooltipContent></Tooltip>
      )}
      {capabilities.includes('fast') && (
        <Tooltip><TooltipTrigger asChild><Zap size={12} className="hover:text-primary transition-colors" /></TooltipTrigger><TooltipContent className="bg-popover border shadow-md"><p>Fast Response</p></TooltipContent></Tooltip>
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
        <SelectTrigger className="w-auto min-w-60 h-auto flex items-center gap-3 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 p-3 border border-border hover:bg-muted/50 transition-all duration-200 rounded-xl">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center">
              {activeModel?.capabilities?.includes('powerful') ? <Sparkles size={14} className="text-primary" /> :
               activeModel?.capabilities?.includes('code') ? <Cpu size={14} className="text-primary" /> : 
               activeModel?.capabilities?.includes('creative') ? <Beaker size={14} className="text-primary" /> :
               activeModel?.capabilities?.includes('multilingual') ? <Languages size={14} className="text-primary" /> :
               activeModel?.capabilities?.includes('chat') ? <MessageSquare size={14} className="text-primary" /> :
               <Zap size={14} className="text-primary" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold leading-none text-foreground truncate">
                {activeModel?.name || 'Select Model'}
              </span>
              <span className="text-xs text-muted-foreground leading-none mt-1.5 truncate">
                via {activeProvider?.name || 'Provider'}
              </span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent align="start" className="w-auto min-w-72 bg-popover/95 backdrop-blur-md border shadow-lg">
          {sortedGroupNames.map((groupName, index) => (
            <React.Fragment key={groupName}>
              {index > 0 && <SelectSeparator className="my-2 bg-border/50" />}
              <SelectGroup> 
                <SelectLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  {groupName}
                </SelectLabel>
                {groupedModels[groupName].map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <SelectItem 
                      key={model.id} 
                      value={model.id} 
                      className={cn(
                        "rounded-lg transition-all duration-200",
                        "focus:bg-primary/10 hover:bg-primary/5",
                        isSelected && "bg-primary/10 border border-primary/20"
                      )}
                    >
                      <div className="flex items-ce nter justify-between w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/30 rounded-md flex items-center justify-center flex-shrink-0">
                            {model.capabilities?.includes('powerful') ? <Sparkles size={10} className="text-primary" /> :
                             model.capabilities?.includes('code') ? <Cpu size={10} className="text-primary" /> : 
                             model.capabilities?.includes('creative') ? <Beaker size={10} className="text-primary" /> :
                             model.capabilities?.includes('multilingual') ? <Languages size={10} className="text-primary" /> :
                             model.capabilities?.includes('chat') ? <MessageSquare size={10} className="text-primary" /> :
                             <Zap size={10} className="text-primary" />}
                          </div>
                          <span className="font-medium truncate">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <CapabilityIcons capabilities={model.capabilities as Capability[]} />
                          {providerStatus[model.providerId] === 'limit_exceeded' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full">
                                  Limit
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-popover border shadow-md">
                                <p>API limit reached</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
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