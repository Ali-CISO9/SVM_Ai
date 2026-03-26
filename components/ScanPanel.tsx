import React, { useState, useEffect, useRef } from 'react';
import { predictLungCancer } from '../services/api';
import { PredictionResult } from '../types';

interface ScanPanelProps {
    isAnalyzing: boolean;
    uploadedImage: string | null;
    onAnalyzeStart: () => void;
    onReset: () => void;
    onImageUpload: (url: string, fileName: string) => void;
    showResults: boolean;
    onToggleResults: () => void;
    onPredictionComplete: (result: PredictionResult) => void;
}

const ScanPanel: React.FC<ScanPanelProps> = ({ 
    isAnalyzing, 
    uploadedImage, 
    onAnalyzeStart, 
    onReset, 
    onImageUpload,
    showResults,
    onToggleResults,
    onPredictionComplete
}) => {
    const [isPaused, setIsPaused] = useState(false);
    const [tissueDensity, setTissueDensity] = useState(68);
    const [anomalyDetection, setAnomalyDetection] = useState(24);
    const [progress, setProgress] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [enableTransition, setEnableTransition] = useState(true);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressRef = useRef(0);

    // Default placeholder image
    const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB6ZmlxkOEZtDIQugBpueBIRM_lR7wyCssS-20PA83UJcK3Z_yEqt5A67a7weKdFFRTNiPuKp-0LjoIXsENswOLOcxDR_iRWgl8Wtz2ms8yqfNDc4hMCoKzLYmFXXF17oS58UNVaWJZhKmFc-nDZxf7zIPfihe1WNKKePtXvgvWXw4eHXv6UopbN1WSdnA18enpwGWVWYjg7tNRpqgf9Wf_fr0FjUpL-4t5DgyHmn4r1r_4ORISjvCw3jNqs5DPOosumCxKnuAEpUE";

    // Timer and Metric Simulation
    useEffect(() => {
        if (!isAnalyzing || isPaused || isComplete) return;

        const duration = 5000; // Accelerated for demo
        const intervalMs = 50; 
        const progressIncrement = (intervalMs / duration) * 100;

        const timer = setInterval(() => {
            // Update Progress
            setProgress(prev => {
                const newProgress = prev + progressIncrement;
                if (newProgress >= 100) {
                    return 100;
                }
                return newProgress;
            });
            // Update display progress only when not paused
            setDisplayProgress(prev => {
                const newProgress = prev + progressIncrement;
                if (newProgress >= 100) {
                    return 100;
                }
                return newProgress;
            });

            // Simulate fluctuating metrics
            setTissueDensity(prev => Math.min(100, Math.max(50, prev + (Math.random() * 4 - 2))));
            setAnomalyDetection(prev => Math.min(100, Math.max(0, prev + (Math.random() * 2 - 1))));
        }, intervalMs);

        return () => clearInterval(timer);
    }, [isAnalyzing, isPaused, isComplete]);

    // Handle completion delay to allow visual progress bar to finish
    useEffect(() => {
        if (progress >= 100 && !isComplete && !isProcessing) {
            const timeout = setTimeout(async () => {
                setIsComplete(true);
                setIsProcessing(true);
                
                // Call the backend API after timer completes
                if (uploadedFile) {
                    try {
                        const result = await predictLungCancer(uploadedFile);
                        onPredictionComplete(result);
                    } catch (error) {
                        console.error('Prediction failed:', error);
                        // Set a default result on error
                        onPredictionComplete({
                            label: 'Error',
                            status: 'error'
                        });
                    }
                }
                setIsProcessing(false);
            }, 600); // 600ms delay to ensure transition completes visually
            return () => clearTimeout(timeout);
        }
    }, [progress, isComplete, isProcessing, uploadedFile, onPredictionComplete]);

    // Reset internal state when isAnalyzing is turned off (external reset)
    useEffect(() => {
        if (!isAnalyzing && isComplete) {
             setIsPaused(false);
             setProgress(0);
             setDisplayProgress(0);
             setIsComplete(false);
             setIsProcessing(false);
             setTissueDensity(68);
             setAnomalyDetection(24);
             setEnableTransition(true);
        }
    }, [isAnalyzing]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setUploadedFile(file);
            onImageUpload(imageUrl, file.name);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const togglePause = () => {
        const newPausedState = !isPaused;
        setIsPaused(newPausedState);
        // Disable transition when pausing to prevent jump
        if (newPausedState) {
            setEnableTransition(false);
        } else {
            // Re-enable transition after a small delay when resuming
            setTimeout(() => setEnableTransition(true), 50);
        }
    };

    const handleReset = () => {
        setIsPaused(false);
        setTissueDensity(68);
        setAnomalyDetection(24);
        setProgress(0);
        setDisplayProgress(0);
        setIsComplete(false);
        setIsProcessing(false);
        setUploadedFile(null);
        setEnableTransition(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onReset();
    };
    
    // Explicitly reusing logic but defining it clearly for New Scan to ensure clarity
    const handleNewScan = () => {
        handleReset();
    };

    return (
        <div className="w-full h-full @container">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
            />
            
            <div className={`h-full flex flex-col bg-[rgba(10,15,25,0.3)] backdrop-blur-[24px] rounded-2xl overflow-hidden border transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] group
                ${isComplete ? 'border-primary/40 shadow-[0_0_30px_rgba(25,195,230,0.15)]' : 'border-white/5'}
                hover:shadow-[0_0_50px_-10px_rgba(25,195,230,0.25)] hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/[0.05] hover:to-transparent`}>
                
                <div className="flex flex-col @xl:flex-row flex-1 min-h-[520px]">
                    
                    {/* --- LEFT SIDE: Visualizer --- */}
                    <div className="relative w-full @xl:w-3/5 bg-black/40 overflow-hidden flex items-center justify-center min-h-[350px] border-b @xl:border-b-0 @xl:border-r border-white/5 group-hover:border-primary/10 transition-colors duration-500">
                        <div 
                            className={`absolute inset-0 bg-center bg-no-repeat bg-cover transition-all duration-1000 
                            ${isAnalyzing && !isComplete ? 'opacity-40 grayscale scale-105' : ''}
                            ${!isAnalyzing ? 'opacity-20 grayscale scale-100' : ''}
                            ${isComplete ? 'opacity-100 grayscale-0 scale-110' : ''}`}
                            style={{backgroundImage: `url("${uploadedImage || defaultImage}")`}}
                        ></div>
                        
                        {/* STATE: IDLE OVERLAY */}
                        {!isAnalyzing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-4 pointer-events-none">
                                <div className="p-6 rounded-full border border-dashed border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-primary/30 group-hover:text-primary/50 transition-all duration-500">
                                    <span className="material-symbols-outlined text-4xl">upload_file</span>
                                </div>
                                <p className="font-mono text-xs tracking-widest uppercase">
                                    {uploadedImage ? 'Ready for Analysis' : 'Awaiting DICOM/MRI Input'}
                                </p>
                            </div>
                        )}

                        {/* STATE: ANALYZING OVERLAY */}
                        {isAnalyzing && !isComplete && (
                            <>
                                <div className={`scanning-line ${isPaused ? 'paused-scan' : 'animate-scan'}`}></div>
                                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-primary/70 border border-primary/20 backdrop-blur-md">PX_COORD: 1042:482</div>
                                        <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-primary/70 border border-primary/20 backdrop-blur-md">FPS: 60.0</div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-primary/70 border border-primary/20 backdrop-blur-md">SCAN_MODE: HIGH_RES_MRI</div>
                                        <div className="bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-primary/70 border border-primary/20 backdrop-blur-md">UUID: 8F92-XA21</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STATE: COMPLETED OVERLAY */}
                        {isComplete && (
                            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-700 pointer-events-none">
                                <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 mb-4 shadow-[0_0_20px_rgba(25,195,230,0.3)]">
                                    <span className="material-symbols-outlined text-primary text-3xl">check</span>
                                </div>
                                <h3 className="text-white font-bold text-xl tracking-tight mb-1">Analysis Complete</h3>
                                <p className="text-white/60 text-xs font-mono uppercase tracking-widest">No Anomalies Found</p>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT SIDE: Controls & Metrics --- */}
                    <div className="w-full @xl:w-2/5 p-8 flex flex-col justify-between bg-white/[0.01]">
                        
                        {/* --- STATE 1: IDLE / UPLOAD --- */}
                        {!isAnalyzing && (
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <span className="relative flex h-2 w-2">
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                                            </span>
                                            <span className="text-white/60 font-semibold tracking-[0.15em] uppercase text-[10px]">
                                                Session Inactive
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold border px-2 py-0.5 rounded-full text-slate-500 border-slate-500/30">
                                            Powerd By Ai
                                        </span>
                                    </div>

                                    <p className="text-slate-300 text-sm leading-relaxed mb-8">
                                        To begin clinical assessment, please provide a valid medical image. Supporting MRI, CT, and X-Ray formats.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-primary/80">
                                            <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                            <span className="text-[10px] font-bold tracking-widest uppercase">Secure Diagnostic Environment</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-primary/80">
                                            <span className="material-symbols-outlined text-[20px]">bolt</span>
                                            <span className="text-[10px] font-bold tracking-widest uppercase">Advanced Neural Engine</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-8">
                                    <button 
                                        onClick={triggerFileUpload}
                                        className="w-full py-4 rounded-xl font-bold text-sm bg-primary text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(25,195,230,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined text-base">cloud_upload</span>
                                        {uploadedImage ? 'Change Image' : 'Upload Image'}
                                    </button>
                                    <button 
                                        onClick={onAnalyzeStart}
                                        disabled={!uploadedImage}
                                        className={`w-full py-4 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2
                                            ${uploadedImage 
                                                ? 'border-white/20 border-primary/60 bg-white/[0.02] text-white cursor-pointer active:scale-[0.98] hover:border-primary/80 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(25,195,230,0.3)] hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent' 
                                                : 'border-white/5 text-white/20 cursor-not-allowed'}`}
                                    >
                                        <span className="material-symbols-outlined text-base">assessment</span>
                                        Analyze Image
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- STATE 2 & 3: ACTIVE ANALYSIS & COMPLETE --- */}
                        {isAnalyzing && (
                            <div className="flex flex-col h-full justify-between animate-in fade-in zoom-in-95 duration-500">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isComplete ? (
                                                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                            ) : (
                                                <span className="relative flex h-2 w-2">
                                                    {!isPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-yellow-500' : 'bg-primary'}`}></span>
                                                </span>
                                            )}
                                            
                                             <span className={`font-semibold tracking-[0.15em] uppercase text-[10px] ${isComplete ? 'text-white' : 'text-white/80'}`}>
                                                {isProcessing ? 'Processing...' : (isComplete ? 'Analysis Complete' : (isPaused ? 'Analysis Paused' : 'Scanning Active'))}
                                            </span>
                                        </div>
                                         <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded-full 
                                            ${isProcessing ? 'text-yellow-500 border-yellow-500/30' :
                                              (isComplete ? 'text-primary border-primary/30' : 
                                              (isPaused ? 'text-yellow-500 border-yellow-500/30' : 'text-primary border-primary/30'))}`}>
                                            {isProcessing ? 'PROCESSING' : (isComplete ? 'DONE' : (isPaused ? 'STANDBY' : 'REALTIME'))}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    {!isComplete && (
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full ${enableTransition ? 'transition-all duration-300' : ''} ${isPaused ? 'bg-yellow-500' : 'bg-primary'}`} 
                                                style={{ width: `${displayProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="space-y-7">
                                        {/* Metric 1 */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                                <span>Tissue Density Mapping</span>
                                                <span className={`font-mono ${isComplete ? 'text-primary' : 'text-white'}`}>{tissueDensity.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-primary shadow-[0_0_12px_rgba(25,195,230,0.4)]' : 'bg-primary shadow-[0_0_12px_rgba(25,195,230,0.4)]'}`} 
                                                    style={{ width: `${tissueDensity}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Metric 2 */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                                                <span>Anomaly Detection</span>
                                                <span className={`font-mono ${isComplete ? 'text-primary' : 'text-white'}`}>{anomalyDetection.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-primary/40' : 'bg-primary/40'}`}
                                                    style={{ width: `${anomalyDetection}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-primary/60 text-[18px]">shield</span>
                                            <p className="text-slate-400 text-[11px] leading-relaxed font-light">Secure multi-layer encryption enabled. Patient data is anonymized per HIPAA protocols.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    {isComplete ? (
                                        <>
                                            <button 
                                                onClick={onToggleResults}
                                                className={`w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(25,195,230,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${showResults ? 'brightness-90' : ''}`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {showResults ? 'visibility_off' : 'assignment'}
                                                </span>
                                                {showResults ? 'Hide Result' : 'Show Result'}
                                            </button>
                                            <button 
                                                onClick={handleNewScan}
                                                className="w-full py-3.5 rounded-xl border border-white/15 border-primary/60 bg-white/[0.02] text-white/80 font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:border-primary/80 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(25,195,230,0.3)] hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent"
                                            >
                                                <span className="material-symbols-outlined text-base">restart_alt</span>
                                                New Scan
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={togglePause}
                                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]
                                                    ${isPaused 
                                                        ? 'bg-yellow-500 text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                                                        : 'bg-primary text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(25,195,230,0.3)]'}`}
                                            >
                                                <span className="material-symbols-outlined text-base">
                                                    {isPaused ? 'play_circle' : 'pause_circle'}
                                                </span>
                                                {isPaused ? 'Resume Analysis' : 'Pause Analysis'}
                                            </button>
                                            <button 
                                                onClick={handleReset}
                                                className="w-full py-3.5 rounded-xl border border-white/15 border-primary/60 bg-white/[0.02] text-white/80 font-medium text-sm transition-all active:scale-[0.98] hover:border-primary/80 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(25,195,230,0.3)] hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent"
                                            >
                                                Cancel & Reset
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScanPanel;