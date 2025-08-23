import { useState } from 'react';
import { Eye, Sparkles, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Mock analysis function - replace with actual API call
const analyzeImage = async (_imageUrl: string): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    description: "This image shows a beautiful landscape with vibrant colors and natural elements. The composition demonstrates good balance and visual appeal.",
    objects: ["landscape", "sky", "trees", "mountains", "clouds"],
    colors: ["blue", "green", "white", "brown"],
    mood: "serene and peaceful",
    technical: {
      dimensions: "1920x1080",
      format: "JPEG",
      quality: "High"
    }
  };
};

interface ImageAnalysisProps {
  imageUrl: string;
  imageName?: string;
  onAnalysisComplete?: (analysis: string) => void;
  className?: string;
}

interface AnalysisResult {
  description: string;
  objects: string[];
  colors: string[];
  mood: string;
  technical: {
    dimensions?: string;
    format?: string;
    quality?: string;
  };
}

export function ImageAnalysis({ 
  imageUrl, 
  imageName = 'Image', 
  onAnalysisComplete,
  className = '' 
}: ImageAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeImage(imageUrl);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className={`w-full max-w-2xl mx-auto ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">Image Analysis</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">AI-powered visual understanding</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border/30">
              <img 
                src={imageUrl} 
                alt={imageName}
                className="w-full h-full object-cover"
                onError={() => setError('Failed to load image')}
              />
            </div>
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              <FileImage className="h-3 w-3 mr-1" />
              {imageName}
            </Badge>
          </div>

          {/* Analyze Button */}
          {!analysis && !error && (
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Image
                </>
              )}
            </Button>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive font-medium">Analysis Failed</p>
              </div>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
              <Button 
                onClick={handleAnalyze}
                variant="outline"
                size="sm"
                className="mt-3 border-destructive/30 hover:bg-destructive/10"
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Analysis Results */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Success Header */}
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-primary">Analysis Complete</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.description}
                  </p>
                </div>

                <Separator />

                {/* Objects Detected */}
                {analysis.objects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Objects Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.objects.map((obj, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="bg-primary/10 text-primary border border-primary/20"
                        >
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {analysis.colors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Dominant Colors</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.colors.map((color, index) => (
                        <Badge key={index} variant="outline">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mood/Atmosphere */}
                {analysis.mood && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Mood & Atmosphere</h4>
                    <Badge className="bg-accent text-accent-foreground">
                      {analysis.mood}
                    </Badge>
                  </div>
                )}

                {/* Technical Details */}
                {Object.keys(analysis.technical).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Technical Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {analysis.technical.dimensions && (
                        <div>
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="ml-2 text-foreground">{analysis.technical.dimensions}</span>
                        </div>
                      )}
                      {analysis.technical.format && (
                        <div>
                          <span className="text-muted-foreground">Format:</span>
                          <span className="ml-2 text-foreground">{analysis.technical.format}</span>
                        </div>
                      )}
                      {analysis.technical.quality && (
                        <div>
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="ml-2 text-foreground">{analysis.technical.quality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Analyze Again Button */}
                <Button 
                  onClick={handleAnalyze}
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 hover:bg-primary/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ImageAnalysis;
