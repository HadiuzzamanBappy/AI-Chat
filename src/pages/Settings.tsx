import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BrainCircuit, PlusCircle, Trash2, FileText, X, KeyRound, Eraser, Download, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useKnowledgebases } from "@/hooks/use-knowledgebases";
import { toast } from "sonner";

const MAX_WORDS = 1500;

export default function Settings() {
  const {
    knowledgebases,
    addKnowledgebase,
    deleteKnowledgebase,
    updateKnowledgebase,
    setActiveKnowledgebase,
  } = useKnowledgebases();

  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [feedDefaultKb, setFeedDefaultKb] = useState(() => {
    const saved = localStorage.getItem('feed_default_kb');
    return saved === null ? false : JSON.parse(saved);
  });

  useEffect(() => {
    setOpenRouterKey(localStorage.getItem('VITE_OPENROUTER_API_KEY') || '');
    setOpenAIKey(localStorage.getItem('VITE_OPENAI_API_KEY') || '');
  }, []);

  useEffect(() => {
    localStorage.setItem('feed_default_kb', JSON.stringify(feedDefaultKb));
  }, [feedDefaultKb]);

  const handleSaveApiKeys = () => {
    localStorage.setItem('VITE_OPENROUTER_API_KEY', openRouterKey);
    localStorage.setItem('VITE_OPENAI_API_KEY', openAIKey);
    toast.success("API Keys Saved", {
      description: "Keys are stored locally in your browser.",
    });
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
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Knowledgebases</CardTitle>
                  <CardDescription>
                    Provide the AI with persistent context. Activate one to use it in all new chats.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>AI Behavior</CardTitle>
                  <CardDescription>
                    Configure how the AI is initialized.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="feed-default-kb">Feed Default Context</Label>
                  <p className="text-sm text-muted-foreground">
                    On first launch, automatically load a default personal context.
                  </p>
                </div>
                <Switch
                  id="feed-default-kb"
                  checked={feedDefaultKb}
                  onCheckedChange={setFeedDefaultKb}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <KeyRound className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>API Key Management</CardTitle>
                  <CardDescription>
                    Securely store your API keys in local browser storage.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                <Input
                  id="openrouter-key"
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-..."
                />
              </div>
              <div>
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <Button onClick={handleSaveApiKeys}>Save API Keys</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Trash2 className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Data Management</CardTitle>
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
                <Eraser className="h-4 w-4 mr-2" />
                Clear All Conversations
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}