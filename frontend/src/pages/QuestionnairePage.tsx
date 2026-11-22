import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, DynamicQuestionResponse, QuestionItem } from '../types';

interface QuestionnairePageProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ onComplete, initialProfile }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>(initialProfile || {
    state: "Kerala",
    assistance_categories: []
  });
  const [stepData, setStepData] = useState<DynamicQuestionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions(currentStep);
  }, [currentStep]);

  const loadQuestions = async (step: number) => {
    setLoading(true);
    try {
      const data = await api.getNextQuestions(step, answers);
      setStepData(data);
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectToggle = (field: string, value: string) => {
    setAnswers(prev => {
      const currentList: string[] = prev[field] || [];
      if (currentList.includes(value)) {
        return { ...prev, [field]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentList, value] };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Build final profile
      const profile: UserProfile = {
        age: answers.age ? Number(answers.age) : undefined,
        state: answers.state || "Kerala",
        district: answers.district,
        residence_type: answers.residence_type,
        education_level: answers.highest_qualification || answers.education_level,
        employment_status: answers.employment_status,
        current_course: answers.current_course,
        year_of_study: answers.year_of_study,
        academic_marks_percent: answers.academic_marks_percent ? Number(answers.academic_marks_percent) : undefined,
        annual_income_inr: answers.annual_income_inr ? Number(answers.annual_income_inr) : undefined,
        income_category: answers.income_category,
        assistance_categories: answers.assistance_categories || [],
        social_category: answers.social_category,
        is_differently_abled: answers.is_differently_abled === 'true' || answers.is_differently_abled === true,
        minority_community: answers.minority_community,
        business_stage: answers.business_stage,
        farming_type: answers.farming_type
      };
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const stepTitles = [
    "Basic Details",
    "Education & Employment",
    "Financial Information",
    "Assistance Needed",
    "Optional Eligibility Quotas"
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>Step {currentStep} of 5: {stepTitles[currentStep - 1]}</span>
          <span>{stepData?.progress_percentage || currentStep * 20}% Completed</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${stepData?.progress_percentage || currentStep * 20}%` }}
          />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500">Preparing dynamic questions tailored for your answers...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">{stepTitles[currentStep - 1]}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {currentStep === 5 
                  ? "Sensitive category questions are completely optional and help match statutory reservation schemes."
                  : "Please answer accurately so our deterministic rules match verified opportunities."}
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {stepData?.questions.map((q: QuestionItem) => (
                <div key={q.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <label className="block text-sm font-bold text-slate-900">
                        {q.title} {q.required && <span className="text-rose-500">*</span>}
                      </label>
                      {q.subtitle && <p className="text-xs text-slate-500 mt-0.5">{q.subtitle}</p>}
                    </div>
                  </div>

                  {/* Render based on question type */}
                  {q.type === 'number' && (
                    <input
                      type="number"
                      value={answers[q.id] || ''}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      placeholder="e.g. 20"
                      className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  )}

                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      placeholder="Enter details..."
                      className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  )}

                  {q.type === 'select' && (
                    <select
                      value={answers[q.id] || ''}
                      onChange={e => handleInputChange(q.id, e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-300 p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Select an option --</option>
                      {q.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {q.type === 'radio' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options?.map(opt => {
                        const isSelected = String(answers[q.id]) === String(opt.value);
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => handleInputChange(q.id, opt.value)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'multiselect' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options?.map(opt => {
                        const currentList: string[] = answers[q.id] || [];
                        const isSelected = currentList.includes(opt.value);
                        return (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => handleMultiSelectToggle(q.id, opt.value)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="flex items-start space-x-1.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Step Navigation Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : <div></div>}

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
              >
                <span>{currentStep === 5 ? 'Analyze & Find Schemes' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
