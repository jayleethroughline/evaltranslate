import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
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
            <Button variant="ghost" size="icon" onClick={openSettings}>
              <Settings className="w-5 h-5" />
            </Button>
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
