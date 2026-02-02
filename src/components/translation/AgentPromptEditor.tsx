import { useState } from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DEFAULT_PROMPTS } from '@/lib/constants';

interface AgentPromptEditorProps {
  prompts: {
    forwardTranslator: string;
    evaluator: string;
    backwardTranslator: string;
    comparator: string;
  };
  onChange: (prompts: AgentPromptEditorProps['prompts']) => void;
}

export function AgentPromptEditor({ prompts, onChange }: AgentPromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onChange(DEFAULT_PROMPTS);
  };

  const handlePromptChange = (agent: keyof typeof prompts, value: string) => {
    onChange({
      ...prompts,
      [agent]: value
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="text-sm font-medium">Advanced: Agent Prompts</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to Defaults
            </Button>
          </div>

          <Tabs defaultValue="forward" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="forward">Forward</TabsTrigger>
              <TabsTrigger value="evaluator">Evaluator</TabsTrigger>
              <TabsTrigger value="backward">Backward</TabsTrigger>
              <TabsTrigger value="comparator">Comparator</TabsTrigger>
            </TabsList>

            <TabsContent value="forward" className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Variables: {'{targetLanguage}'}, {'{text}'}, {'{customInstructions}'}
              </div>
              <Textarea
                value={prompts.forwardTranslator}
                onChange={(e) => handlePromptChange('forwardTranslator', e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
            </TabsContent>

            <TabsContent value="evaluator" className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Variables: {'{targetLanguage}'}, {'{originalText}'}, {'{translatedText}'}, {'{customInstructions}'}
              </div>
              <Textarea
                value={prompts.evaluator}
                onChange={(e) => handlePromptChange('evaluator', e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
            </TabsContent>

            <TabsContent value="backward" className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Variables: {'{targetLanguage}'}, {'{translatedText}'}
              </div>
              <Textarea
                value={prompts.backwardTranslator}
                onChange={(e) => handlePromptChange('backwardTranslator', e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
            </TabsContent>

            <TabsContent value="comparator" className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Variables: {'{targetLanguage}'}, {'{originalText}'}, {'{backTranslation}'}, {'{forwardScore}'}, {'{evaluatorFeedback}'}, {'{customInstructions}'}
              </div>
              <Textarea
                value={prompts.comparator}
                onChange={(e) => handlePromptChange('comparator', e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
