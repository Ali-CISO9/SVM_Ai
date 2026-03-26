import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScanPanel from './components/ScanPanel';
import AnalysisResults from './components/AnalysisResults';
import { PredictionResult } from './types';

const App: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [showResults, setShowResults] = useState(false);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);

    const handleReset = () => {
        setIsAnalyzing(false);
        setUploadedImage(null);
        setFileName('');
        setShowResults(false);
        setPrediction(null);
    };

    const handleImageUpload = (url: string, name: string) => {
        setUploadedImage(url);
        setFileName(name);
    };

    const handleToggleResults = () => {
        setShowResults(prev => !prev);
    };

    const handlePredictionComplete = (result: PredictionResult) => {
        setPrediction(result);
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden moody-bg text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 grain-overlay z-[1]"></div>
            <div className="absolute inset-0 conical-light z-[2]"></div>
            
            {/* Added: Ambient Cyan Glows for richer background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[0]">
                <div className="absolute top-[-10%] right-[10%] w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-cyan-400/[0.02] rounded-full blur-[150px] mix-blend-screen"></div>
            </div>

            <Header />

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-10 pt-32 pb-16">
                <div className="w-full flex flex-col items-center">
                    
                    <div className={`mb-24 text-center transition-all duration-700 ${showResults ? 'translate-y-[-20px]' : ''}`}>
                        <h1 className="text-white tracking-tight text-[36px] md:text-[54px] font-bold leading-[1.1] max-w-5xl mx-auto">
                            Histopathological Analysis Using <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">Convolutional Neural Networks</span>
                        </h1>
                        <p className="text-slate-400 mt-5 text-lg font-light max-w-xl mx-auto leading-relaxed">
                            Upload patient imaging data to initialize the diagnostic system for histopathological image classification.
                        </p>
                    </div>

                    {/* Main Content Area: Side-by-side transition wrapper */}
                    <div className={`
                        flex flex-row items-stretch justify-center 
                        transition-[max-width,gap] duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
                        w-full
                        ${showResults ? 'max-w-[1600px] gap-6' : 'max-w-[900px] gap-0'}
                    `}>
                        
                        {/* ScanPanel Container */}
                        <div className={`
                            flex-shrink-0
                            transition-[width] duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
                            ${showResults ? 'w-[calc(50%-12px)]' : 'w-full'}
                        `}>
                            <ScanPanel 
                                onAnalyzeStart={() => setIsAnalyzing(true)} 
                                isAnalyzing={isAnalyzing} 
                                onReset={handleReset}
                                uploadedImage={uploadedImage}
                                onImageUpload={handleImageUpload}
                                showResults={showResults}
                                onToggleResults={handleToggleResults}
                                onPredictionComplete={handlePredictionComplete}
                            />
                        </div>

                        {/* AnalysisResults Container */}
                        <div className={`
                            flex-shrink-0 relative
                            transition-[width,opacity,transform] duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
                            overflow-hidden
                            ${showResults 
                                ? 'w-[calc(50%-12px)] opacity-100 translate-x-0' 
                                : 'w-0 opacity-0 translate-x-12 pointer-events-none'}
                        `}>
                            {/* Inner container locked to a fixed minimum width to prevent reflow during slide */}
                            <div className="w-full h-full min-w-[450px]">
                                <AnalysisResults 
                                    imageName={fileName} 
                                    onNewScan={handleReset}
                                    prediction={prediction}
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default App;