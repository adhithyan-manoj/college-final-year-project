import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { ResultsPage } from './pages/ResultsPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { ComparePage } from './pages/ComparePage';
import { SavedSchemesPage } from './pages/SavedSchemesPage';
import { ChatAssistantPage } from './pages/ChatAssistantPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserProfile, RecommendationResponse, RecommendationItem } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<RecommendationItem[]>([]);
  const [userId] = useState<string>('guest-citizen-kerala-2026');
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);

  // Load saved schemes on mount
  useEffect(() => {
    loadSavedSchemes();
  }, []);

  const loadSavedSchemes = async () => {
    try {
      const items = await api.getSavedSchemes(userId);
      const ids = new Set(items.map(i => i.scheme_id));
      setSavedSchemeIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async (schemeId: string) => {
    const isSaved = savedSchemeIds.has(schemeId);
    if (isSaved) {
      await api.removeSavedScheme(userId, schemeId);
      setSavedSchemeIds(prev => {
        const next = new Set(prev);
        next.delete(schemeId);
        return next;
      });
    } else {
      await api.saveScheme(userId, schemeId);
      setSavedSchemeIds(prev => new Set(prev).add(schemeId));
    }
  };

  const handleToggleCompare = (item: RecommendationItem) => {
    setCompareList(prev => {
      const exists = prev.some(c => c.scheme.scheme_id === item.scheme.scheme_id);
      if (exists) {
        return prev.filter(c => c.scheme.scheme_id !== item.scheme.scheme_id);
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 schemes at a time.");
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  const handleProfileComplete = async (profile: UserProfile) => {
    setUserProfile(profile);
    setLoadingRecs(true);
    setActiveTab('results');
    try {
      const res = await api.getRecommendations(profile);
      setRecommendations(res);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
      alert("Error calculating recommendations. Please verify the backend is running.");
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSelectSample = (sample: UserProfile) => {
    handleProfileComplete(sample);
  };

  const handleQuickSearch = async (query: string) => {
    // Generate an open query profile
    const profile: UserProfile = {
      state: "Kerala",
      assistance_categories: ["all available opportunities"],
      extra_attributes: { search_term: query }
    };
    handleProfileComplete(profile);
  };

  const handleViewDetails = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setActiveTab('detail');
  };

  const handleAskAIAboutScheme = (schemeId: string, schemeName: string) => {
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedSchemeIds.size}
        compareCount={compareList.length}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartQuestionnaire={() => setActiveTab('questionnaire')}
            onSelectSampleProfile={handleSelectSample}
            onSearchSchemes={handleQuickSearch}
          />
        )}

        {activeTab === 'questionnaire' && (
          <QuestionnairePage
            onComplete={handleProfileComplete}
            initialProfile={userProfile}
          />
        )}

        {activeTab === 'results' && (
          <ResultsPage
            results={recommendations}
            userProfile={userProfile}
            onEditProfile={() => setActiveTab('questionnaire')}
            onViewDetails={handleViewDetails}
            savedSchemeIds={savedSchemeIds}
            onToggleSave={handleToggleSave}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onGoToCompare={() => setActiveTab('compare')}
          />
        )}

        {activeTab === 'detail' && selectedSchemeId && (
          <SchemeDetailPage
            schemeId={selectedSchemeId}
            onBack={() => setActiveTab('results')}
            isSaved={savedSchemeIds.has(selectedSchemeId)}
            onToggleSave={handleToggleSave}
            onAskAIAboutScheme={handleAskAIAboutScheme}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePage
            compareList={compareList}
            onRemoveFromCompare={(id) => setCompareList(prev => prev.filter(c => c.scheme.scheme_id !== id))}
            onClearCompare={() => setCompareList([])}
            onBack={() => setActiveTab('results')}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === 'saved' && (
          <SavedSchemesPage
            userId={userId}
            onViewDetails={handleViewDetails}
            onRemoveSave={handleToggleSave}
          />
        )}

        {activeTab === 'chat' && (
          <ChatAssistantPage />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      <Footer />
    </div>
  );
}
