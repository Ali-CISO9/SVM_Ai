import React from 'react';
import { PredictionResult } from '../types';
import jsPDF from 'jspdf';

interface AnalysisResultsProps {
    imageName: string;
    onNewScan: () => void;
    prediction: PredictionResult | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ imageName, onNewScan, prediction }) => {
    // Determine display values based on prediction
    const isError = prediction?.status === 'error';
    const isHealthy = prediction?.status === 'healthy'; // 'Normal', 'Colon Benign Tissue'
    const label = prediction?.label || (isError ? 'Error' : 'Unknown Status');
    const confidence = prediction?.confidence || (isError ? 'N/A' : 'High confidence');
    
    // Status text mapping
    const statusText = isError ? 'Error' : (isHealthy ? 'Healthy' : 'Critical');
    const statusColor = isError ? 'text-red-400' : (isHealthy ? 'text-emerald-400' : 'text-red-400');
    
    const getStatusSubtext = (className: string) => {
        if (isError) return 'Analysis failed';
        switch (className) {
           case 'Normal':
           case 'Colon Benign Tissue':
               return 'No anomalies found';
           case 'Lung Adenocarcinoma':
           case 'Lung Squamous Cell Carcinoma':
           case 'Colon Adenocarcinoma':
               return 'Seek Immediate Medical Help';
           default:
               return 'Requires review';
        }
    };
    
    const statusSubtext = getStatusSubtext(label);

    // Dynamic advice generator based on specific classes
    const getAdviceContent = (className: string) => {
        if (isError) {
             return {
                intro: 'Analysis encountered an error. Please try again with a different image.',
                bulletPoints: [
                    'Check that the image file is valid and not corrupted.',
                    'Ensure the image is in a supported format (JPEG, PNG, DICOM).',
                    'Try uploading a different image.',
                    'If the problem persists, please contact technical support.'
                ]
            };
        }
        
        if (className === 'Normal' || className === 'Colon Benign Tissue') {
            return {
                intro: `Based on the preliminary analysis, the scan indicates ${className.toLowerCase()}, showing normal tissue density with no immediate irregularities. To maintain good health, the following steps are recommended:`,
                bulletPoints: [
                    'Routine Screening: Continue with standard annual health check-ups as advised by your GP.',
                    'Healthy Lifestyle: Maintain a balanced diet and regular exercise routine.',
                    'Environmental Factors: Avoid exposure to known carcinogens and pollutants.',
                    'Symptom Monitoring: Consult a doctor if you experience any new or persistent symptoms.'
                ]
            };
        }
        
        if (className === 'Lung Adenocarcinoma' || className === 'Lung Squamous Cell Carcinoma') {
            return {
                intro: `The AI analysis has detected patterns consistent with ${className}. Please remain calm, but take the following specific actions immediately:`,
                bulletPoints: [
                    'Specialist Consultation: Schedule an appointment with a Pulmonologist or Oncologist within the next 48 hours.',
                    'Further Testing: Request a high-resolution CT scan or tissue biopsy to validate these AI-generated findings.',
                    'Prepare Records: Print this report and bring your original medical images to your appointment.',
                    'Symptom Documentation: Document any recent weight loss, persistent cough, coughing up blood, or breathing difficulties.',
                    'Support System: Bring a family member or friend to your appointments to help take notes and provide support.'
                ]
            };
        }
        
        if (className === 'Colon Adenocarcinoma') {
             return {
                intro: 'The AI analysis has detected patterns consistent with Colon Adenocarcinoma. Please remain calm, but take the following specific actions immediately:',
                bulletPoints: [
                    'Specialist Consultation: Schedule an appointment with a Gastroenterologist or Oncologist within the next 48 hours.',
                    'Further Testing: Request a colonoscopy or targeted biopsy to validate these AI-generated findings.',
                    'Prepare Records: Print this report and bring your original medical images to your appointment.',
                    'Symptom Documentation: Document any recent changes in bowel habits, weight loss, or abdominal discomfort.',
                    'Support System: Bring a family member or friend to your appointments to help take notes and provide support.'
                ]
            };
        }

        return { intro: 'Results require professional medical review.', bulletPoints: [] };
    };

    // Dynamic key findings generator
    const getKeyFindings = (className: string) => {
        if (isError) {
            return [
                'Analysis encountered an error',
                'Please try again with a different image'
            ];
        }
        
        switch (className) {
            case 'Normal':
                return [
                    'Healthy lung tissue density identified',
                    'No irregular cellular morphology detected',
                    'No signs of carcinoma or malignancy'
                ];
            case 'Colon Benign Tissue':
                return [
                    'Healthy colonic tissue density identified',
                    'Glandular structures appear normal',
                    'No signs of adenomatous changes'
                ];
            case 'Lung Adenocarcinoma':
                return [
                    'Abnormal glandular tissue patterns detected in lung sample',
                    'Irregular cell morphology consistent with adenocarcinoma',
                    'Markers indicate high probability of malignancy'
                ];
            case 'Lung Squamous Cell Carcinoma':
                return [
                    'Abnormal squamous cell patterns detected in lung sample',
                    'Keratinization or intracellular bridges likely present',
                    'Markers indicate high probability of malignancy'
                ];
            case 'Colon Adenocarcinoma':
                return [
                    'Abnormal glandular tissue localized in colonic sample',
                    'Irregular cell structures breaking basement membrane',
                    'Markers indicate high probability of malignancy'
                ];
            default:
                return ['Awaiting manual physician review'];
        }
    };

    // PDF Download Handler
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPosition = 20;

        // Header Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('AI-Powered Histopathology Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const currentDate = new Date().toLocaleString();
        doc.text(`Date: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        doc.setDrawColor(100, 100, 100);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        yPosition += 15;

        // Result Section - Diagnosis
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Primary Diagnosis:', margin, yPosition);
        
        yPosition += 8;
        doc.setFontSize(18);
        doc.setTextColor(!isHealthy && !isError ? 220 : 16, !isHealthy && !isError ? 38 : 185, !isHealthy && !isError ? 38 : 129);
        doc.text(label.toUpperCase(), margin, yPosition);
        
        yPosition += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Severity Status: ${statusText}`, margin, yPosition);
        
        if (prediction?.confidence) {
             doc.text(`AI Confidence Level: ${prediction.confidence}`, margin + 80, yPosition);
        }
        
        yPosition += 15;

        // Key Findings Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Findings:', margin, yPosition);
        
        yPosition += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const findings = getKeyFindings(label);
        findings.forEach((finding, index) => {
            doc.text(`${index + 1}. ${finding}`, margin + 5, yPosition);
            yPosition += 7;
        });
        
        yPosition += 8;

        // Recommendations Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations:', margin, yPosition);
        
        yPosition += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const advice = getAdviceContent(label);
        
        // Intro text
        const introLines = doc.splitTextToSize(advice.intro, pageWidth - (margin * 2));
        doc.text(introLines, margin, yPosition);
        yPosition += introLines.length * 6 + 5;
        
        // Bullet points
        advice.bulletPoints.forEach((point, index) => {
            const bulletLines = doc.splitTextToSize(`${index + 1}. ${point}`, pageWidth - (margin * 2) - 5);
            doc.text(bulletLines, margin + 5, yPosition);
            yPosition += bulletLines.length * 6 + 3;
        });
        
        yPosition += 10;

        // Footer / Disclaimer
        const disclaimer = 'DISCLAIMER: This report is generated by an AI Screening Tool based on a 5-class deep learning model. It is NOT a definitive medical diagnosis. Do not ignore professional medical advice based on this document.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
        
        // Position disclaimer at bottom of page
        const pageHeight = doc.internal.pageSize.getHeight();
        const disclaimerY = pageHeight - 30 - (disclaimerLines.length * 5);
        
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'italic');
        doc.text(disclaimerLines, margin, disclaimerY);

        // Save the PDF
        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`Pathology_Report_${dateStr}.pdf`);
    };
    
    // UI Color themes based on state
    const cardBorderColor = isError ? 'border-red-500/30' : (!isHealthy ? 'border-red-500/30' : 'border-emerald-500/30');
    const cardHoverShadow = isError ? 'hover:shadow-[0_0_50px_-10px_rgba(239,68,68,0.25)]' : (!isHealthy ? 'hover:shadow-[0_0_50px_-10px_rgba(239,68,68,0.25)]' : 'hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.25)]');
    const cardHoverBg = isError ? 'hover:from-red-500/[0.05]' : (!isHealthy ? 'hover:from-red-500/[0.05]' : 'hover:from-emerald-500/[0.05]');
    const baseCardClass = `bg-[#05080f]/60 border rounded-xl p-6 transition-all duration-500 group ${cardBorderColor} ${cardHoverShadow} ${cardHoverBg} hover:to-transparent hover:bg-gradient-to-br`;

    return (
        <div className="h-full w-full relative">
             <div className="h-full flex flex-col bg-[rgba(10,15,25,0.3)] backdrop-blur-[24px] rounded-2xl p-8 border border-primary/40 shadow-[0_0_30px_rgba(25,195,230,0.15)] transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(25,195,230,0.25)] hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/[0.05] hover:to-transparent group">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-12 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                         <span className="material-symbols-outlined text-primary text-2xl">neurology</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-white tracking-tight">AI Pathology Report</h2>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-slate-500 text-xs font-mono tracking-wide flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">image</span>
                                {imageName || 'Scan_2025.dcm'}
                            </p>
                            {confidence !== 'N/A' && (
                                <p className="text-[10px] font-mono font-bold border px-2 py-0.5 rounded text-primary border-primary/30 bg-primary/10">
                                    CONFIDENCE: {confidence}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 flex flex-col gap-4">
                    
                    {/* Top Row: Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Scan Detection Card */}
                        <div className={`${baseCardClass} flex flex-col justify-center`}>
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`material-symbols-outlined text-[14px] ${!isHealthy && !isError ? 'text-red-400' : 'text-slate-500'}`}>biotech</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">CLASSIFICATION</span>
                            </div>
                            <div className={`text-xl font-bold mb-1 tracking-tight leading-tight ${!isHealthy && !isError ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isError ? 'Error' : label}
                            </div>
                            <div className="text-slate-400 text-[11px] font-medium tracking-wide">
                                Primary network diagnosis
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`${baseCardClass} flex flex-col justify-center`}>
                             <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-slate-500 text-[14px]">verified_user</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">SEVERITY</span>
                            </div>
                            <div className={`text-3xl font-bold mb-1 tracking-tight ${statusColor}`}>{statusText}</div>
                            <div className="text-slate-400 text-[11px] font-medium tracking-wide">{statusSubtext}</div>
                        </div>
                    </div>

                    {/* Key Findings Card */}
                    <div className={`${baseCardClass} flex-1`}>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-lg">show_chart</span>
                            <span className="text-white font-bold text-sm tracking-wide">Pathological Findings</span>
                        </div>
                        
                        <div className="space-y-5">
                            {getKeyFindings(label).map((finding, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${isError ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : (!isHealthy ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]')}`}></span>
                                    <span className="text-slate-300 text-sm font-light leading-snug">{finding}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 pt-2">
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isError}
                        className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(25,195,230,0.2)] border 
                        ${isError 
                            ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed hidden' 
                            : 'bg-primary text-black hover:brightness-110 border-primary/40 hover:border-primary/50'}`}
                    >
                        Download Report
                    </button>
                     <button 
                        onClick={onNewScan}
                        className="w-full mt-3 py-3.5 rounded-xl border border-white/15 border-primary/60 bg-white/[0.02] text-white/80 font-medium text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:border-primary/80 hover:text-white hover:shadow-[0_0_20px_-5px_rgba(25,195,230,0.3)] hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent"
                    >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        New Scan
                    </button>
                </div>

             </div>
        </div>
    );
};

export default AnalysisResults;