import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ConversationalSection } from './components/ConversationalSection'
import { HowItWorks } from './components/HowItWorks'
import { WhyRecoza } from './components/WhyRecoza'
import { ValueComparison } from './components/ValueComparison'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { AuthPage } from './components/auth/AuthPage'
import { PreferenceSetup } from './components/onboarding/PreferenceSetup'
import { Dashboard } from './components/dashboard/Dashboard'
import { MyPreferencesView } from './components/preferences/MyPreferencesView'
import { SavedItemsView } from './components/saved/SavedItemsView'
import { SettingsModal } from './components/modals/SettingsModal'
import { ItemDetailModal } from './components/ItemDetailModal'
import { UserProfile, Item } from './types'
import { fetchCurrentUser, submitFeedback, toggleSavedItem, fetchSavedItems } from './api'

type AppView = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'preferences' | 'saved'

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [selectedItemForModal, setSelectedItemForModal] = useState<Item | null>(null)
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set())
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialPrompt, setInitialPrompt] = useState<string>('')

  // 1. Check local session on initial mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('recoza_user_id')
    if (storedUserId) {
      fetchCurrentUser(storedUserId)
        .then(user => {
          setCurrentUser(user)
          // If first time user, take to onboarding, else keep current view or dashboard
          if (user.is_first_time) {
            setCurrentView('onboarding')
          }
          // Also fetch saved items for bookmark indicators
          fetchSavedItems(user.user_id)
            .then(res => setSavedItemIds(new Set(res.items.map(i => i.item_id))))
            .catch(() => {})
        })
        .catch(() => {
          localStorage.removeItem('recoza_user_id')
          localStorage.removeItem('recoza_token')
        })
        .finally(() => setInitialLoading(false))
    } else {
      setInitialLoading(false)
    }
  }, [])

  // Navigation handlers
  const handleGetStarted = (promptText?: string) => {
    if (promptText) {
      setInitialPrompt(promptText)
    }
    if (currentUser) {
      if (currentUser.is_first_time) {
        setCurrentView('onboarding')
      } else {
        setCurrentView('dashboard')
      }
    } else {
      setCurrentView('auth')
    }
  }

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user)
    if (user.is_first_time) {
      setCurrentView('onboarding')
    } else {
      setCurrentView('dashboard')
    }
  }

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('recoza_user_id')
    localStorage.removeItem('recoza_token')
    setCurrentUser(null)
    setCurrentView('landing')
    setSettingsModalOpen(false)
  }

  const handleModalFeedback = async (itemId: string, type: 'like' | 'dislike') => {
    if (!currentUser) return
    try {
      await submitFeedback({
        user_id: currentUser.user_id,
        item_id: itemId,
        feedback_type: type
      })
    } catch (err) {
      console.error('Failed to submit modal feedback:', err)
    }
  }

  const handleModalToggleSave = async (item: Item) => {
    if (!currentUser) return
    try {
      const res = await toggleSavedItem(currentUser.user_id, item.item_id)
      setSavedItemIds(prev => {
        const next = new Set(prev)
        if (res.is_saved) {
          next.add(item.item_id)
        } else {
          next.delete(item.item_id)
        }
        return next
      })
    } catch (err) {
      console.error('Failed to toggle save from modal:', err)
    }
  }

  // ── Render View 1: Auth Page ──
  if (currentView === 'auth') {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        onBackToHome={() => setCurrentView('landing')}
      />
    )
  }

  // ── Render View 2: Onboarding Preference Setup ──
  if (currentView === 'onboarding' && currentUser) {
    return (
      <PreferenceSetup
        user={currentUser}
        onComplete={handleOnboardingComplete}
        onSkip={() => setCurrentView('dashboard')}
      />
    )
  }

  // ── Render View 3: Dashboard + Chat ──
  if (currentView === 'dashboard' && currentUser) {
    return (
      <>
        <Dashboard
          user={currentUser}
          initialPrompt={initialPrompt}
          onClearInitialPrompt={() => setInitialPrompt('')}
          onLogout={handleLogout}
          onNavigate={(view) => {
            if (view === 'preferences') setCurrentView('preferences')
            else if (view === 'saved') setCurrentView('saved')
            else setCurrentView('dashboard')
          }}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenItemDetail={(item) => setSelectedItemForModal(item)}
        />

        {/* Item Detail Modal */}
        {selectedItemForModal && (
          <ItemDetailModal
            item={selectedItemForModal}
            isSaved={savedItemIds.has(selectedItemForModal.item_id)}
            onToggleSave={handleModalToggleSave}
            onClose={() => setSelectedItemForModal(null)}
            onFeedback={handleModalFeedback}
            onAskChat={(query) => {
              setSelectedItemForModal(null)
              setCurrentView('dashboard')
            }}
          />
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={settingsModalOpen}
          user={currentUser}
          onClose={() => setSettingsModalOpen(false)}
          onLogout={handleLogout}
        />
      </>
    )
  }

  // ── Render View 4: My Preferences ──
  if (currentView === 'preferences' && currentUser) {
    return (
      <MyPreferencesView
        user={currentUser}
        onBack={() => setCurrentView('dashboard')}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      />
    )
  }

  // ── Render View 5: Saved Items & History ──
  if (currentView === 'saved' && currentUser) {
    return (
      <>
        <SavedItemsView
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onResumeChat={(sessionId) => setCurrentView('dashboard')}
          onOpenItemDetail={(item) => setSelectedItemForModal(item)}
        />

        {selectedItemForModal && (
          <ItemDetailModal
            item={selectedItemForModal}
            isSaved={savedItemIds.has(selectedItemForModal.item_id)}
            onToggleSave={handleModalToggleSave}
            onClose={() => setSelectedItemForModal(null)}
            onFeedback={handleModalFeedback}
            onAskChat={(query) => {
              setSelectedItemForModal(null)
              setCurrentView('dashboard')
            }}
          />
        )}
      </>
    )
  }

  // ── Render View 6: Complete Landing Page (Default) ──
  return (
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] font-sans selection:bg-teal-500/30 selection:text-teal-200 relative overflow-x-hidden">
      
      {/* ── Single Unified Background System Across the Entire Page ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Emerald glow top left */}
        <div className="absolute -top-36 -left-36 w-[650px] h-[650px] rounded-full bg-emerald-500/12 blur-[150px] animate-pulse-glow" />
        {/* Teal glow center */}
        <div className="absolute top-1/3 left-1/3 w-[550px] h-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
        {/* Indigo glow top right */}
        <div className="absolute top-16 right-0 w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[160px] animate-pulse-glow" style={{ animationDelay: '3.5s' }} />
        {/* Cyan glow bottom */}
        <div className="absolute bottom-10 right-10 w-[650px] h-[650px] rounded-full bg-teal-400/10 blur-[170px]" />

        {/* Ambient Graph Nodes and Connections Used Subtly as Decoration */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#2DD4BF" strokeWidth="0.75" strokeOpacity="0.35">
            <line x1="8%" y1="18%" x2="18%" y2="28%" />
            <line x1="18%" y1="28%" x2="12%" y2="42%" />
            <line x1="18%" y1="28%" x2="28%" y2="24%" />
            <line x1="28%" y1="24%" x2="35%" y2="38%" />
            <line x1="12%" y1="42%" x2="25%" y2="52%" />
            <line x1="68%" y1="14%" x2="80%" y2="20%" />
            <line x1="80%" y1="20%" x2="74%" y2="34%" />
            <line x1="80%" y1="20%" x2="90%" y2="30%" />
            <line x1="74%" y1="34%" x2="86%" y2="46%" />
          </g>
          <g fill="#2DD4BF">
            <circle cx="8%" cy="18%" r="2" opacity="0.6" />
            <circle cx="18%" cy="28%" r="3" opacity="0.8" />
            <circle cx="12%" cy="42%" r="2.5" opacity="0.7" />
            <circle cx="28%" cy="24%" r="2" opacity="0.5" />
            <circle cx="35%" cy="38%" r="3" opacity="0.75" />
            <circle cx="25%" cy="52%" r="2" opacity="0.6" />
            <circle cx="68%" cy="14%" r="2.5" opacity="0.6" />
            <circle cx="80%" cy="20%" r="3" opacity="0.8" />
            <circle cx="74%" cy="34%" r="2" opacity="0.5" />
            <circle cx="90%" cy="30%" r="2.5" opacity="0.7" />
            <circle cx="86%" cy="46%" r="3" opacity="0.75" />
          </g>
        </svg>
      </div>

      {/* ── Section 1: Navbar ── */}
      <Navbar
        currentUser={currentUser ? {
          username: currentUser.email || currentUser.user_id,
          name: currentUser.name,
          user_id: currentUser.user_id,
          role: currentUser.role
        } : null}
        onOpenAuth={() => {
          if (currentUser) {
            setCurrentView('dashboard')
          } else {
            setCurrentView('auth')
          }
        }}
        onGetStarted={handleGetStarted}
      />

      {/* ── Main Landing Page Content ── */}
      <main className="relative z-10 flex flex-col">
        {/* ── Section 2: Hero Section & Conversational Recommendation Preview (2-Column Desktop) ── */}
        <Hero
          onDiscover={(queryText) => {
            handleGetStarted(queryText)
          }}
          onExploreHowItWorks={() => {
            const el = document.getElementById('how-it-works')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* ── Section A: Personalization, Made Conversational ── */}
        <ConversationalSection />

        {/* ── Section B: How Recoza Works ── */}
        <HowItWorks />

        {/* ── Section C: Why Recoza? ── */}
        <WhyRecoza />

        {/* ── Section D: More Than a List of Results ── */}
        <ValueComparison />

        {/* ── Section E: Final Call to Action ── */}
        <FinalCTA onDiscoverClick={handleGetStarted} />
      </main>

      {/* ── Section 7: Footer ── */}
      <Footer />

    </div>
  )
}
export default App
