/**
 * Settings Page Component
 * 
 * Comprehensive settings management interface for AI chat configuration.
 * Handles API keys, knowledge bases, custom agents, and application preferences.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BrainCircuit, PlusCircle, Trash2, FileText, X, KeyRound, Eraser, Download, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useKnowledgebases } from "@/hooks/use-knowledgebases";
import { toast } from "sonner";
import { useAgents } from "@/hooks/use-agents";
import { PROVIDERS } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Maximum word limit for knowledge base content */
const MAX_WORDS = 1500;

/**
 * Main Settings Component
 * 
 * Provides tabbed interface for managing:
 * - API key configuration for multiple providers
 * - Knowledge base creation and management  
 * - Custom AI agent definitions
 * - Application preferences and defaults
 */
export default function Settings() {
  // Knowledge base management hooks
  const {
    knowledgebases,
    addKnowledgebase,
    deleteKnowledgebase,
    updateKnowledgebase,
    setActiveKnowledgebase,
  } = useKnowledgebases();
  
  // AI agent management hooks  
  const { agents, addAgent, updateAgent, deleteAgent } = useAgents();

  // API key storage and visibility state
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [visibleApis, setVisibleApis] = useState<string[]>([]);
  
  // Default knowledge base feeding preference
  const [feedDefaultKb, setFeedDefaultKb] = useState(() => {
    const saved = localStorage.getItem('feed_default_kb');
    return saved === null ? false : JSON.parse(saved);
  });

  useEffect(() => {
    const loadedKeys: Record<string, string> = {};
    const initialVisible: string[] = [];

    PROVIDERS.forEach(provider => {
      const storedKey = localStorage.getItem(provider.apiKeyEnvVar);
      if (storedKey !== null) {
        loadedKeys[provider.id] = storedKey;
        initialVisible.push(provider.id);
      }
    });

    setApiKeys(loadedKeys);
    setVisibleApis(initialVisible);
  }, []);

  useEffect(() => {
    localStorage.setItem('feed_default_kb', JSON.stringify(feedDefaultKb));
  }, [feedDefaultKb]);

  const handleSaveApiKeys = () => {
    visibleApis.forEach(providerId => {
      const provider = PROVIDERS.find(p => p.id === providerId);
      if (provider) {
        localStorage.setItem(provider.apiKeyEnvVar, apiKeys[providerId] || '');
      }
    });
    toast.success("API Keys Saved", { description: "Keys are stored locally in your browser." });
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all conversations? This action cannot be undone.")) {
      localStorage.removeItem('chat_conversations');
      localStorage.removeItem('active_conversation_id');
      toast.success("Conversation history cleared.");
      window.location.href = "/";
    }
  };

  const handleExportHistory = () => {
    const history = localStorage.getItem('chat_conversations');
    if (history) {
      const blob = new Blob([history], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("History exported successfully.");
    } else {
      toast.error("No history to export.");
    }
  };

  const [newKbName, setNewKbName] = useState('');
  const fileInputRefs = useRef(new Map<string, HTMLInputElement | null>());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, kbId: string) => {
    if (!e.target.files) return;
    const currentKb = knowledgebases.find(kb => kb.id === kbId);
    if (!currentKb) return;

    const newFiles = Array.from(e.target.files).map(file => {
      return new Promise<{ name: string; content: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve({ name: file.name, content: event.target?.result as string });
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    });

    Promise.all(newFiles).then(filesToAdd => {
      updateKnowledgebase(kbId, {
        files: [...currentKb.files, ...filesToAdd],
      });
    });
    if (e.target) e.target.value = "";
  };

  const removeFile = (kbId: string, fileName: string) => {
    const currentKb = knowledgebases.find(kb => kb.id === kbId);
    if (currentKb) {
      updateKnowledgebase(kbId, {
        files: currentKb.files.filter(f => f.name !== fileName)
      });
    }
  };

  const apiProviders = PROVIDERS.map(provider => ({
    ...provider,
    key: apiKeys[provider.id] || '',
    setKey: (value: string) => setApiKeys(prev => ({ ...prev, [provider.id]: value })),
  }));

  const addedProviders = apiProviders.filter(p => visibleApis.includes(p.id));
  const availableProviders = apiProviders.filter(p => !visibleApis.includes(p.id));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-2 mb-6 sm:mb-8 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate min-w-0">Configurations</h1>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
          <Tabs defaultValue="agents" className="w-full overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
              <TabsTrigger value="agents" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-w-0">
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline truncate">Agents</span>
                <span className="xs:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-w-0">
                <BrainCircuit className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline truncate">Knowledge</span>
                <span className="xs:hidden">KB</span>
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-w-0">
                <KeyRound className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline truncate">API Keys</span>
                <span className="xs:hidden">Keys</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-w-0">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden xs:inline truncate">Data</span>
                <span className="xs:hidden">Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-4 mt-4 sm:mt-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-start gap-2 text-lg sm:text-xl min-w-0">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" />
                    <span className="break-words min-w-0">Agent Management</span>
                  </CardTitle>
                  <CardDescription className="text-sm break-words">
                    Create and customize AI personalities for different use cases.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <Button onClick={addAgent} className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add New Agent
                  </Button>

                  {/* Nested Accordion for the list of agents */}
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {agents.map((agent) => (
                      <AccordionItem value={agent.id} key={agent.id} className="border rounded-md bg-background/50 overflow-hidden">
                        <AccordionTrigger className="px-3 sm:px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full min-w-0 gap-2">
                            <div className="text-left min-w-0 flex-1">
                              <p className="font-medium break-words text-sm sm:text-base">{agent.name}</p>
                              <p className="text-xs text-muted-foreground font-normal break-words line-clamp-2">
                                {agent.description}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 sm:px-4 pb-4 space-y-4">
                          <div>
                            <Label>Agent Name</Label>
                            <Input
                              value={agent.name}
                              onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                              placeholder="e.g., React Expert"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={agent.description}
                              onChange={(e) => updateAgent(agent.id, { description: e.target.value })}
                              placeholder="e.g., An expert in modern frontend development."
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>System Prompt</Label>
                            <Textarea
                              placeholder="Define the agent's personality and instructions..."
                              value={agent.systemPrompt}
                              onChange={(e) => updateAgent(agent.id, { systemPrompt: e.target.value })}
                              className="mt-1 min-h-[140px]"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4 mt-4 sm:mt-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-start gap-2 text-lg sm:text-xl min-w-0">
                    <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" />
                    <span className="break-words min-w-0">Knowledgebases</span>
                  </CardTitle>
                  <CardDescription className="text-sm break-words">
                    Provide the AI with persistent context and information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-end mb-4 gap-3 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="feed-default-kb" className="text-sm font-medium">Owner Context</Label>
                    <Switch id="feed-default-kb" checked={feedDefaultKb} onCheckedChange={setFeedDefaultKb} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    placeholder="New knowledgebase name..."
                    value={newKbName}
                    onChange={(e) => setNewKbName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newKbName.trim()) {
                        addKnowledgebase(newKbName.trim());
                        setNewKbName('');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (newKbName.trim()) {
                        addKnowledgebase(newKbName.trim());
                        setNewKbName('');
                      }
                    }}
                    disabled={!newKbName.trim()}
                    className="w-full sm:w-auto"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                <AnimatePresence>
                  {knowledgebases.map((kb) => {
                    const wordCount = kb.content.split(/\s+/).filter(Boolean).length;
                    return (
                      <motion.div key={kb.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="border bg-gray-500/10 shadow-sm overflow-hidden">
                          <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 p-4 sm:p-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap min-w-0">
                                <CardTitle className="text-base sm:text-lg break-words min-w-0">{kb.name}</CardTitle>
                                <Badge variant={kb.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                                  {kb.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <CardDescription className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {wordCount} words
                                </Badge>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {kb.files.length} files
                                </Badge>
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Switch
                                checked={kb.isActive}
                                onCheckedChange={(checked) => setActiveKnowledgebase(checked ? kb.id : null)}
                              />
                              <Button variant="ghost" size="icon" onClick={() => deleteKnowledgebase(kb.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                            <div>
                              <Label className="text-sm">Custom Instructions (Text)</Label>
                              <Textarea
                                placeholder="Tell the AI about your preferences..."
                                value={kb.content}
                                onChange={(e) => updateKnowledgebase(kb.id, { content: e.target.value })}
                                className="mt-2 min-h-[100px] sm:min-h-[120px] text-sm"
                              />
                              <div className="space-y-2 mt-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={wordCount > MAX_WORDS ? 'text-destructive' : 'text-muted-foreground'}>
                                    {wordCount} / {MAX_WORDS} words
                                  </span>
                                  <span className={`${wordCount > MAX_WORDS ? 'text-destructive' : wordCount > MAX_WORDS * 0.8 ? 'text-purple-600' : 'text-muted-foreground'}`}>
                                    {Math.round((wordCount / MAX_WORDS) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(wordCount / MAX_WORDS) * 100} 
                                  className={`w-full h-2 ${wordCount > MAX_WORDS ? 'text-destructive' : ''}`}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">Attached Files</Label>
                              <div className="mt-2 space-y-2">
                                {kb.files.map(file => (
                                  <div key={file.name} className="flex items-center justify-between bg-background p-2 rounded-md">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FileText className="h-4 w-4 shrink-0" />
                                      <span className="text-sm truncate">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 ml-2" onClick={() => removeFile(kb.id, file.name)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button variant="outline" className="mt-2 w-full text-xs sm:text-sm" onClick={() => fileInputRefs.current.get(kb.id)?.click()}>
                                <PlusCircle className="h-4 w-4 mr-2" /> Add File
                              </Button>
                              <Input
                                type="file"
                                ref={(node) => {
                                  const map = fileInputRefs.current;
                                  if (node) {
                                    map.set(kb.id, node);
                                  } else {
                                    map.delete(kb.id);
                                  }
                                }}
                                className="hidden"
                                multiple
                                accept=".txt,.md,.json,.js,.ts,.tsx,.css"
                                onChange={(e) => handleFileChange(e, kb.id)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-4 mt-4 sm:mt-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-start gap-2 text-lg sm:text-xl min-w-0">
                    <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" />
                    <span className="break-words min-w-0">API Key Management</span>
                  </CardTitle>
                  <CardDescription className="text-sm break-words">
                    Store your API keys in local browser storage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="flex flex-col gap-3 sm:gap-4 items-center w-full">
                    {addedProviders.map((provider) => (
                      <div key={provider.id} className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor={`${provider.id}-key`} className="text-sm font-medium">{provider.name} API Key</Label>
                          <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => {
                            provider.setKey('');
                            localStorage.removeItem(provider.apiKeyEnvVar);
                            setVisibleApis(prev => prev.filter(id => id !== provider.id));
                            toast.info(`${provider.name} API Key removed.`);
                          }}>
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <Input 
                          id={`${provider.id}-key`} 
                          type="password" 
                          value={provider.key} 
                          onChange={(e) => provider.setKey(e.target.value)} 
                          placeholder="Enter your key..." 
                          className="text-sm"
                        />
                      </div>
                    ))}
                    {addedProviders.length === 0 && (
                      <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">No API keys added. Click "Add Key" to start.</p>
                    )}
                    {addedProviders.length > 0 && (
                      <div className="flex justify-end w-full">
                        <Button onClick={handleSaveApiKeys} className="w-full sm:w-auto text-sm">Save All Keys</Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    {availableProviders.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full bg-secondary text-sm">
                            <PlusCircle className="h-4 w-4 mr-2" /> Add API Key ({availableProviders.length} available)
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end" side="bottom" sideOffset={8}>
                          {availableProviders.map((provider) => (
                            <DropdownMenuItem 
                              key={provider.id} 
                              onClick={() => setVisibleApis(prev => [...prev, provider.id])}
                              className="text-sm cursor-pointer hover:bg-accent focus:bg-accent"
                            >
                              <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4" />
                                {provider.name}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        All available providers have been added.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-4 sm:mt-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-start gap-2 text-lg sm:text-xl min-w-0">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-1" />
                    <span className="break-words min-w-0">Data Management</span>
                  </CardTitle>
                  <CardDescription className="text-sm break-words">
                    Manage your conversation history and exported data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <Button variant="outline" onClick={handleExportHistory} className="text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export History
                  </Button>
                  <Button variant="destructive" onClick={handleClearHistory} className="text-sm">
                    <Eraser className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}