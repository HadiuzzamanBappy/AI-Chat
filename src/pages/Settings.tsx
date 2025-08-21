import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

const MAX_WORDS = 1500;

export default function Settings() {
  const {
    knowledgebases,
    addKnowledgebase,
    deleteKnowledgebase,
    updateKnowledgebase,
    setActiveKnowledgebase,
  } = useKnowledgebases();
  const { agents, addAgent, updateAgent, deleteAgent } = useAgents();

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [visibleApis, setVisibleApis] = useState<string[]>([]);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-2 mb-8">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">AI Settings</h1>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="agents" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center space-x-3 text-left">
                  <Bot className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Agent Management</p>
                    <p className="text-sm text-muted-foreground font-normal">
                      Create and customize AI personalities.
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="space-y-4">
                  <Button onClick={addAgent} className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add New Agent
                  </Button>

                  {/* Nested Accordion for the list of agents */}
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {agents.map((agent) => (
                      <AccordionItem value={agent.id} key={agent.id} className="border rounded-md bg-background/50">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full">
                            <div className="text-left">
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-xs text-muted-foreground font-normal truncate max-w-[200px] sm:max-w-xs">
                                {agent.description}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="mr-2 shrink-0" onClick={(e) => { e.stopPropagation(); deleteAgent(agent.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 space-y-4">
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

                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="knowledge" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-3 text-left">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">Knowledgebases</p>
                      <p className="text-sm text-muted-foreground font-normal">Provide the AI with persistent context.</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                <div className="flex items-center space-x-2 mr-4 justify-end" onClick={(e) => e.stopPropagation()}>
                  <Label htmlFor="feed-default-kb" className="text-sm font-normal text-muted-foreground">Owner Context</Label>
                  <Switch id="feed-default-kb" checked={feedDefaultKb} onCheckedChange={setFeedDefaultKb} />
                </div>
                <div className="flex items-center gap-2">
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
                  />
                  <Button
                    onClick={() => {
                      if (newKbName.trim()) {
                        addKnowledgebase(newKbName.trim());
                        setNewKbName('');
                      }
                    }}
                    disabled={!newKbName.trim()}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                <AnimatePresence>
                  {knowledgebases.map((kb) => {
                    const wordCount = kb.content.split(/\s+/).filter(Boolean).length;
                    return (
                      <motion.div key={kb.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="border bg-gray-500/10 shadow-sm">
                          <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                              <CardTitle>{kb.name}</CardTitle>
                              <CardDescription>{kb.isActive ? "Active" : "Inactive"}</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                              <Switch
                                checked={kb.isActive}
                                onCheckedChange={(checked) => setActiveKnowledgebase(checked ? kb.id : null)}
                              />
                              <Button variant="ghost" size="icon" onClick={() => deleteKnowledgebase(kb.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Custom Instructions (Text)</Label>
                              <Textarea
                                placeholder="Tell the AI about your preferences..."
                                value={kb.content}
                                onChange={(e) => updateKnowledgebase(kb.id, { content: e.target.value })}
                                className="mt-2 min-h-[120px]"
                              />
                              <p className={`text-xs mt-2 ${wordCount > MAX_WORDS ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {wordCount} / {MAX_WORDS} words
                              </p>
                            </div>
                            <div>
                              <Label>Attached Files</Label>
                              <div className="mt-2 space-y-2">
                                {kb.files.map(file => (
                                  <div key={file.name} className="flex items-center justify-between bg-background p-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="text-sm truncate">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(kb.id, file.name)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button variant="outline" className="mt-2 w-full" onClick={() => fileInputRefs.current.get(kb.id)?.click()}>
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api-keys" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-3 text-left">
                    <KeyRound className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">API Key Management</p>
                      <p className="text-sm text-muted-foreground font-normal">Store your API keys in local browser storage.</p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
                <div className="flex flex-col gap-2 items-end w-full">
                  {addedProviders.map((provider) => (
                    <div key={provider.id} className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <Label htmlFor={`${provider.id}-key`}>{provider.name} API Key</Label>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          provider.setKey('');
                          localStorage.removeItem(provider.apiKeyEnvVar);
                          setVisibleApis(prev => prev.filter(id => id !== provider.id));
                          toast.info(`${provider.name} API Key removed.`);
                        }}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <Input id={`${provider.id}-key`} type="password" value={provider.key} onChange={(e) => provider.setKey(e.target.value)} placeholder="Enter your key..." />
                    </div>
                  ))}
                  {addedProviders.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No API keys added. Click "Add Key" to start.</p>
                  )}
                  {addedProviders.length > 0 && (
                    <Button onClick={handleSaveApiKeys}>Save All Keys</Button>
                  )}
                </div>

                {availableProviders.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full bg-secondary" onClick={(e) => e.stopPropagation()}>
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Key
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {availableProviders.map((provider) => (
                        <DropdownMenuItem key={provider.id} onSelect={() => setVisibleApis(prev => [...prev, provider.id])}>
                          {provider.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Trash2 className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">Data Management</p>
                  <CardDescription>
                    Manage your conversation history.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Button variant="outline" onClick={handleExportHistory}>
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
              <Button variant="destructive" onClick={handleClearHistory}>
                <Eraser className="h-4 w-4 mr-2 text-wrap" />
                Clear History
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}