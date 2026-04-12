import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, BarChart3, Search, TrendingUp, Lightbulb, 
    RefreshCw, AlertTriangle, Settings, Loader2,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useAppearance } from '@/hooks/use-appearance';

interface AIInsightsPanelProps {
    dateRange: DateRange | undefined;
}

type TabKey = 'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive';

interface TabConfig {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    emoji: string;
    color: string;
    activeColor: string;
    bgGradient: string;
    description: string;
}

const TABS: TabConfig[] = [
    {
        key: 'descriptive',
        label: 'Descriptive',
        icon: BarChart3,
        emoji: '📊',
        color: 'text-blue-600 dark:text-blue-400',
        activeColor: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
        bgGradient: 'from-blue-500/5 to-transparent dark:from-blue-500/10 dark:to-transparent',
        description: 'Analyzes historical data to explain what happened during the selected period.',
    },
    {
        key: 'diagnostic',
        label: 'Diagnostic',
        icon: Search,
        emoji: '🔍',
        color: 'text-purple-600 dark:text-purple-400',
        activeColor: 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400',
        bgGradient: 'from-purple-500/5 to-transparent dark:from-purple-500/10 dark:to-transparent',
        description: 'Digs deeper into the data to identify patterns and why certain events occurred.',
    },
    {
        key: 'predictive',
        label: 'Predictive',
        icon: TrendingUp,
        emoji: '📈',
        color: 'text-emerald-600 dark:text-emerald-400',
        activeColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        bgGradient: 'from-emerald-500/5 to-transparent dark:from-emerald-500/10 dark:to-transparent',
        description: 'Uses historical trends to forecast future booking volumes and luggage counts.',
    },
    {
        key: 'prescriptive',
        label: 'Prescriptive',
        icon: Lightbulb,
        emoji: '💡',
        color: 'text-orange-600 dark:text-amber-400',
        activeColor: 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-amber-400',
        bgGradient: 'from-orange-500/5 to-transparent dark:from-orange-500/10 dark:to-transparent',
        description: 'Provides actionable recommendations to optimize operations and increase revenue.',
    },
];

// Parse the AI's markdown response into the four sections
function parseSections(text: string): Record<TabKey, string> {
    const sections: Record<TabKey, string> = {
        descriptive: '',
        diagnostic: '',
        predictive: '',
        prescriptive: '',
    };

    if (!text) return sections;

    // First try: Split by markdown headers
    // We look for lines starting with ## or lines that have been formatted as headers
    const chunks = text.split(/(?=^##\s+)/m);
    
    for (const chunk of chunks) {
        const trimmed = chunk.trim();
        if (!trimmed.startsWith('##')) continue;
        
        const lines = trimmed.split('\n');
        const header = lines[0].toLowerCase();
        const content = lines.slice(1).join('\n').trim();
        
        if (header.includes('descriptive')) sections.descriptive = content;
        else if (header.includes('diagnostic')) sections.diagnostic = content;
        else if (header.includes('predictive')) sections.predictive = content;
        else if (header.includes('prescriptive')) sections.prescriptive = content;
    }

    // Fallback: Use improved regex for streaming/partial matches
    // The previous regexes were too strict about emojis and newlines
    if (!sections.descriptive || !sections.prescriptive) {
        const getMatch = (keyword: string) => {
            const regex = new RegExp(`##\\s*.*?${keyword}.*?\\n?([\\s\\S]*?)(?=##\\s*|$)`, 'i');
            const match = text.match(regex);
            return match ? match[1].trim() : '';
        };

        if (!sections.descriptive) sections.descriptive = getMatch('descriptive');
        if (!sections.diagnostic) sections.diagnostic = getMatch('diagnostic');
        if (!sections.predictive) sections.predictive = getMatch('predictive');
        if (!sections.prescriptive) sections.prescriptive = getMatch('prescriptive');
    }

    return sections;
}

// Render markdown text as styled HTML
function renderMarkdown(text: string) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listKey = 0;

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${listKey++}`} className="space-y-2 my-3">
                    {listItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground dark:text-gray-300">
                            <ChevronRight className="w-3.5 h-3.5 mt-1 text-orange-500 dark:text-orange-400 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.match(/^[-*]\s+/)) {
            listItems.push(line.replace(/^[-*]\s+/, ''));
            continue;
        }

        flushList();

        if (line.match(/^###\s+/)) {
            elements.push(
                <h4 key={i} className="text-sm font-semibold text-foreground dark:text-gray-200 mt-4 mb-2">
                    {line.replace(/^###\s+/, '')}
                </h4>
            );
        } else if (line.trim() === '') {
            // skip empty lines
        } else {
            elements.push(
                <p key={i} className="text-sm leading-relaxed text-muted-foreground dark:text-gray-300 my-1.5" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
            );
        }
    }

    flushList();

    return <>{elements}</>;
}

function formatInline(text: string): string {
    // Bold
    let result = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground dark:text-white font-semibold">$1</strong>');
    // Inline code
    result = result.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-muted dark:bg-white/10 rounded text-orange-600 dark:text-orange-300 text-xs font-mono">$1</code>');
    // Italic
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return result;
}

export function AIInsightsPanel({ dateRange }: AIInsightsPanelProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('descriptive');
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const sections = parseSections(rawText);

    const generateAnalysis = useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        // Abort any in-flight request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        setError(null);
        setRawText('');
        setHasGenerated(true);
        setActiveTab('descriptive');

        try {
            // Get XSRF-TOKEN from Laravel's cookie
            const xsrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const res = await fetch('/reports/ai-analyze', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(xsrfToken ?? ''),
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    start_date: format(dateRange.from, 'yyyy-MM-dd'),
                    end_date: format(dateRange.to, 'yyyy-MM-dd'),
                }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || `Request failed with status ${res.status}`);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let accumulated = '';
            let lineBuffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = (lineBuffer + chunk).split('\n');
                
                // The last element might be a partial line
                lineBuffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        const jsonStr = trimmedLine.slice(6).trim();
                        if (jsonStr === '[DONE]') continue;
                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.text) {
                                accumulated += data.text;
                                setRawText(accumulated);

                                // Auto-switch tab based on which section is currently streaming
                                // We check if the AI just sent a header
                                if (data.text.includes('##')) {
                                    const lowerAcc = accumulated.toLowerCase();
                                    const lastHeaderIndex = lowerAcc.lastIndexOf('##');
                                    const lastHeader = lowerAcc.slice(lastHeaderIndex);
                                    
                                    if (lastHeader.includes('prescriptive')) setActiveTab('prescriptive');
                                    else if (lastHeader.includes('predictive')) setActiveTab('predictive');
                                    else if (lastHeader.includes('diagnostic')) setActiveTab('diagnostic');
                                }
                            }
                        } catch {
                            // Skip malformed JSON chunks
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message || 'Failed to generate analysis');
        } finally {
            setIsLoading(false);
        }
    }, [dateRange]);

    const activeTabConfig = TABS.find(t => t.key === activeTab)!;
    const currentContent = sections[activeTab];

    // Determine what content to show while streaming
    const isCurrentTabStreaming = isLoading && !currentContent;
    const showStreamingRaw = isLoading && !sections.descriptive; // Still in preamble / first section

    return (
        <Card className="overflow-hidden shadow-lg border-0 bg-background dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 text-foreground dark:text-white">
            {/* Header */}
            <CardHeader className="relative overflow-hidden pb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-600/20 dark:via-amber-500/10 dark:to-transparent" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            {isLoading && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                                </span>
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                AI Insights
                                <Badge className="text-[10px] font-medium bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 border-orange-500/30 hover:bg-orange-500/30">
                                    BETA
                                </Badge>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                                Powered by your configured AI model
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-6 px-4 sm:px-6">
                {/* Not yet generated state */}
                {!hasGenerated && !error && (
                    <div className="space-y-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {TABS.map((tab) => (
                                <div 
                                    key={tab.key} 
                                    className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors group cursor-default"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={cn("p-2 rounded-lg bg-orange-500/10", tab.color)}>
                                            <tab.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-sm tracking-tight">{tab.label}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {tab.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-center justify-center py-6 gap-4 border-t border-border mt-6">
                            <div className="text-center space-y-2 mb-4">
                                <h4 className="font-semibold text-sm">Ready to Generate Insights</h4>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Click the button below to start the AI analysis for the selected date range.
                                </p>
                            </div>
                            <Button
                                onClick={generateAnalysis}
                                disabled={isLoading || !dateRange?.from || !dateRange?.to}
                                size="lg"
                                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 px-8 font-bold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate Analysis
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>
                            {error.includes('not configured') && (
                                <a
                                    href="/settings/ai-assistant"
                                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 mt-2 transition-colors"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Go to AI Assistant Settings
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Analysis Tabs & Content */}
                {hasGenerated && !error && (
                    <div className="space-y-4">
                        {/* Tab bar */}
                        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl overflow-x-auto">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.key;
                                const hasContent = !!sections[tab.key];
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={cn(
                                            "flex-1 min-w-0 flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 relative",
                                            isActive
                                                ? tab.activeColor + " border shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span className="truncate w-full text-center">{tab.label}</span>
                                        {isLoading && !hasContent && (
                                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
                                        )}
                                        {hasContent && (
                                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab content */}
                        <div className={cn("relative min-h-[200px] rounded-xl border border-border bg-gradient-to-b", activeTabConfig.bgGradient)}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-5"
                                >
                                    {/* Section header */}
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{activeTabConfig.emoji}</span>
                                            <div>
                                                <h3 className={cn("text-sm font-bold", activeTabConfig.color)}>
                                                    {activeTabConfig.label} Analysis
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {activeTabConfig.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generateAnalysis}
                                            disabled={isLoading}
                                            className="h-8 gap-1.5 text-xs font-semibold hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
                                        >
                                            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                                            Regenerate
                                        </Button>
                                    </div>

                                    {/* Content */}
                                    {currentContent ? (
                                        <div className="prose-sm">
                                            {renderMarkdown(currentContent)}
                                        </div>
                                    ) : isLoading ? (
                                        <div className="space-y-3">
                                            {showStreamingRaw && rawText ? (
                                                <p className="text-sm text-gray-400 whitespace-pre-wrap">{rawText}</p>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        {sections.descriptive ? 'AI is analyzing this section...' : 'AI is generating insights...'}
                                                    </div>
                                                    <div className="space-y-2.5 mt-4">
                                                        {[...Array(4)].map((_, i) => (
                                                            <div key={i} className="flex items-start gap-2.5">
                                                                <div className="w-3.5 h-3.5 mt-0.5 rounded bg-white/5 animate-pulse" />
                                                                <div className="flex-1 space-y-1.5">
                                                                    <div
                                                                        className="h-3 bg-white/5 rounded animate-pulse"
                                                                        style={{ width: `${75 - i * 12}%`, animationDelay: `${i * 0.15}s` }}
                                                                    />
                                                                    <div
                                                                        className="h-3 bg-white/[0.03] rounded animate-pulse"
                                                                        style={{ width: `${60 - i * 8}%`, animationDelay: `${i * 0.15 + 0.1}s` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            No content was generated for this section. Try regenerating the analysis.
                                        </p>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
