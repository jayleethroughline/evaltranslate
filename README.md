# Dataset Translation Web Application

A fully client-side React + TypeScript web application for translating datasets using a multi-agent AI workflow with quality assurance. All data is stored in browser localStorage with direct Google Gemini API calls.

## Features

- **Multi-Agent Translation Workflow**: Uses 4 AI agents for high-quality translations:
  1. Forward Translator - Translates from English to target language
  2. Evaluator - Assesses forward translation quality
  3. Backward Translator - Translates back to English
  4. Comparator - Compares original and back-translation to provide final recommendation

- **23 Supported Languages**: Chinese, Spanish, Hindi, Arabic, Bengali, Portuguese, Russian, Japanese, Punjabi, German, Javanese, Korean, French, Telugu, Marathi, Turkish, Tamil, Vietnamese, Urdu, Italian, Thai, Polish, Dutch

- **Local Storage**: All datasets and jobs stored in browser localStorage
- **CSV Import/Export**: Upload datasets as CSV, export results
- **Real-time Progress Tracking**: Monitor translation jobs with live updates
- **Custom Instructions**: Add specific instructions for translations
- **Agent Prompt Customization**: Modify the prompts for each AI agent
- **Quality Metrics**: View forward and final quality scores, recommendations

## Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd evaltranslate
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Usage

### First Time Setup

1. When you first open the app, you'll be prompted to enter your Google Gemini API key
2. Your API key is stored locally in your browser and only used to call the Gemini API

### Translating a Dataset

1. **Upload a CSV file**:
   - Click "Upload CSV" button
   - Select a CSV file with at least one text column
   - The app will auto-detect the "prompt" column or use the first text column

2. **Configure Translation**:
   - Select your uploaded dataset
   - Choose target language from 23 supported languages
   - (Optional) Add custom instructions for the translation
   - (Optional) Customize agent prompts in Advanced options

3. **Start Translation**:
   - Review the cost estimate
   - Click "Start Translation"
   - Monitor progress in real-time on the right panel

4. **View Results**:
   - Click the eye icon on completed jobs
   - Filter results by ACCEPT/REVISE recommendations
   - View detailed feedback from all agents
   - Export results to CSV or save as a new dataset

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── dataset/         # Dataset management components
│   └── translation/     # Translation workflow components
├── hooks/               # React hooks
├── lib/
│   ├── services/        # Business logic (Translation, Dataset)
│   ├── storage/         # localStorage wrapper
│   ├── constants.ts     # Configuration and defaults
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
├── App.tsx              # Main app component
└── main.tsx             # React entry point
```

## API Rate Limiting

The app implements rate limiting to respect Gemini API constraints:
- 500ms delay between API calls
- Automatic retry with exponential backoff on rate limit errors
- Each row requires 4 API calls (one per agent)

## Storage Limits

The app uses browser localStorage which has a limit of 5-10MB depending on the browser. For large datasets, consider:
- Processing in smaller batches
- Exporting results regularly
- Deleting old jobs after saving

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icons
- **Google Gemini API** - AI translation

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
