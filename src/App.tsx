import { useState, useEffect } from 'react';
import { Settings, Info } from 'lucide-react';
import { DatasetTranslation } from '@/components/translation/DatasetTranslation';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { storageManager } from '@/lib/storage/LocalStorageManager';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    const savedApiKey = storageManager.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyDialog(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (tempApiKey) {
      storageManager.saveApiKey(tempApiKey);
      setApiKey(tempApiKey);
      setShowApiKeyDialog(false);
      setShowSettingsDialog(false);
    }
  };

  const openSettings = () => {
    setTempApiKey(apiKey);
    setShowSettingsDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dataset Translation</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered multi-agent translation with quality assurance
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowInfoDialog(true)}>
                <Info className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={openSettings}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {apiKey ? (
          <DatasetTranslation />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Please configure your API key to get started
            </p>
          </div>
        )}
      </main>

      {/* API Key Dialog (First Time) */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Dataset Translation</DialogTitle>
            <DialogDescription>
              To get started, please enter your Google Gemini API key. You can get one from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google AI Studio
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your Gemini API key..."
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent anywhere except to Google's API.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveApiKey} disabled={!tempApiKey}>
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your application settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Gemini API Key</label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter your Gemini API key..."
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!tempApiKey}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>How It Works</DialogTitle>
            <DialogDescription>
              Understanding the 4-agent translation workflow and application architecture
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Workflow Explanation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Multi-Agent Translation Workflow</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Each translation goes through 4 specialized AI agents to ensure quality and accuracy:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">1. Forward Translator</h4>
                  <p className="text-sm text-muted-foreground">
                    Translates the original text into the target language while preserving risk signals.
                    Adapts culturally inappropriate items (e.g., "gun" in Korea → "pills" or "knife")
                    while maintaining the same risk level.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">2. Evaluator</h4>
                  <p className="text-sm text-muted-foreground">
                    Checks if the translation preserved all risk factors with the same strength.
                    Scores the translation (0-100) based on signal preservation, cultural appropriateness,
                    and naturalness. Uses strict criteria to ensure gold-standard quality.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">3. Back Translator</h4>
                  <p className="text-sm text-muted-foreground">
                    Translates the target language back to English literally to expose any meaning changes.
                    This helps verify that risk signals were actually preserved in the translation.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium">4. Comparator</h4>
                  <p className="text-sm text-muted-foreground">
                    Compares the original with the back-translation and simulates what an ML classifier
                    would detect in each. Gives final score and recommendation (ACCEPT/REVISE).
                    Ensures the translation is suitable for gold-standard evaluation datasets.
                  </p>
                </div>
              </div>
            </div>

            {/* Mermaid Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Workflow Diagram</h3>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-x-auto">
{`graph TB
    A[Original Text<br/>English] -->|1. Forward Translation| B[Forward Translator]
    B -->|Translated Text<br/>+ Rationale| C[Evaluator]
    C -->|Forward Score<br/>+ Feedback| D{Score >= 70?}
    D -->|Yes| E[Back Translator]
    D -->|No| X[Stop - Failed]
    E -->|Back Translation| F[Comparator]
    C -->|Forward Feedback| F
    F -->|Final Score<br/>+ Recommendation| G{ACCEPT or<br/>REVISE?}
    G -->|ACCEPT| H[Ready for Export]
    G -->|REVISE| I[Manual Review<br/>+ Editing]
    I --> H

    style B fill:#3b82f6
    style C fill:#22c55e
    style E fill:#a855f7
    style F fill:#f97316
    style H fill:#10b981
    style X fill:#ef4444`}
                </pre>
              </div>
            </div>

            {/* Architecture */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Application Architecture</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-foreground">Frontend:</strong>
                  <span className="text-muted-foreground"> React 18 + TypeScript + Vite, with Tailwind CSS and shadcn/ui components</span>
                </div>
                <div>
                  <strong className="text-foreground">Storage:</strong>
                  <span className="text-muted-foreground"> Browser localStorage - all datasets and jobs stored client-side (no backend)</span>
                </div>
                <div>
                  <strong className="text-foreground">AI Model:</strong>
                  <span className="text-muted-foreground"> Google Gemini 3 Flash Preview via direct API calls</span>
                </div>
                <div>
                  <strong className="text-foreground">Processing:</strong>
                  <span className="text-muted-foreground"> Sequential row-by-row translation with 4 API calls per row (takes ~10-15 seconds per row)</span>
                </div>
                <div>
                  <strong className="text-foreground">Data Flow:</strong>
                  <span className="text-muted-foreground"> CSV Upload → Dataset Storage → Translation Job → 4-Agent Processing → Results Table → CSV Export</span>
                </div>
                <div>
                  <strong className="text-foreground">Deployment:</strong>
                  <span className="text-muted-foreground"> Static site on Vercel with auto-deploy from GitHub on every push</span>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Purpose</h3>
              <p className="text-sm text-muted-foreground">
                This tool creates gold-standard translated datasets for evaluating ML risk classifiers.
                The 4-agent workflow ensures translations preserve exact risk signals (factors, strength,
                temporal markers, intensity) so that classifiers can be fairly tested for F1 score,
                precision, and recall across languages.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>All data is stored locally in your browser. No data is sent to any server except the Gemini API for translation.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
