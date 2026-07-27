import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './presentation/themes/theme';

import { LandingPage } from './presentation/pages/LandingPage';
import { StudioPage } from './presentation/pages/StudioPage';
import { WidgetStudioPage } from './presentation/pages/WidgetStudioPage';
import { TemplatesPage } from './presentation/pages/TemplatesPage';
import { TemplateDetailPage } from './presentation/pages/TemplateDetailPage';
import { LoginPage } from './presentation/pages/LoginPage';
import { CheckoutPage } from './presentation/pages/CheckoutPage';
import { CalendarEmbedPage } from './presentation/pages/CalendarEmbedPage';
import { ClockEmbedPage } from './presentation/pages/ClockEmbedPage';
import { BoardEmbedPage } from './presentation/pages/BoardEmbedPage';
import { TimerEmbedPage } from './presentation/pages/TimerEmbedPage';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import { DebugOverlay } from './presentation/components/debug/DebugOverlay';
import { ClaudeFeedback } from './presentation/components/dev/ClaudeFeedback';
import { BranchSwitcher } from './presentation/components/dev/BranchSwitcher';
import { DevPanelsToggle } from './presentation/components/dev/DevPanelsToggle';
import { DesignSystemPage } from './presentation/pages/DesignSystemPage';
import { LabPage } from './presentation/pages/LabPage';
import { PrivacyPage } from './presentation/pages/PrivacyPage';
import { TermsPage } from './presentation/pages/TermsPage';
import { RefundPage } from './presentation/pages/RefundPage';
import { LegalPage } from './presentation/pages/LegalPage';
import { SettingsPage } from './presentation/pages/SettingsPage';
import { ResetPasswordPage } from './presentation/pages/ResetPasswordPage';
import { VerifyEmailPage } from './presentation/pages/VerifyEmailPage';
import { PageTransition } from './presentation/components/shared/PageTransition';
import { ConsentBanner } from './presentation/components/shared/ConsentBanner';
import { CartProvider } from './presentation/context/CartContext';
import { AuthProvider } from './presentation/context/AuthContext';
import { UpgradeModalProvider } from './presentation/context/UpgradeModalContext';

import { DIContainer } from './infrastructure/di/DIContainer';

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fonts.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }

  *:focus-visible {
    outline: 2px solid #3384F4;
    outline-offset: 2px;
  }

  *:focus:not(:focus-visible) {
    outline: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* Embed routes (Calendar / Clock / Board) render INSIDE Notion's iframe
 * via iframely. Notion's sandboxed iframe blocks third-party cookies and
 * may throw on localStorage / Supabase init, which used to crash the
 * whole React tree. Detect the path early and render an "embed-only"
 * subtree that skips Auth/Cart/UpgradeModal providers entirely — embed
 * pages don't need any of them. Per "виджеты не работают при вставке в
 * Notion" (c_2026-05-05). */
const isEmbedRoute = typeof window !== 'undefined' &&
  window.location.pathname.startsWith('/embed/');

function App() {
  const diContainer = DIContainer.getInstance();

  if (isEmbedRoute) {
    return (
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Router basename="/" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/embed/calendar" element={<CalendarEmbedPage />} />
              <Route path="/embed/clock" element={<ClockEmbedPage />} />
              <Route path="/embed/board" element={<BoardEmbedPage />} />
              <Route path="/embed/timer" element={<TimerEmbedPage />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
        <CartProvider>
          <Router basename="/" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {/* UpgradeModalProvider needs Router context (uses useNavigate), so it sits inside <Router>. */}
            <UpgradeModalProvider>
              <ScrollToTop />
              <DebugOverlay />
              {import.meta.env.DEV && <DevPanelsToggle />}
              {/* BranchSwitcher hidden — design-experiment is the only
                  branch in active use; main is no longer maintained
                  and there are no other feature branches yet. Re-mount
                  if/when we revive a multi-branch flow. */}
              {false && import.meta.env.DEV && <BranchSwitcher />}
              {import.meta.env.DEV && <ClaudeFeedback />}
              <PageTransition>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/widgets" element={<WidgetStudioPage />} />
                  {/* /dashboard = dashboard view (Welcome + Widgets/Purchases tabs).
                      /studio    = widget editor (entered via Edit/Customize actions
                      that navigate here with a widget pre-loaded into state). Both
                      paths render the same StudioPage; pathname picks the view. */}
                  <Route path="/dashboard" element={<StudioPage diContainer={diContainer} />} />
                  <Route path="/studio" element={<StudioPage diContainer={diContainer} />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/templates/:id" element={<TemplateDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/dev" element={<DesignSystemPage />} />
                  {/* Internal: unreleased work. Unlinked from site chrome on purpose. */}
                  <Route path="/lab" element={<LabPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/refund" element={<RefundPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </PageTransition>
              <ConsentBanner />
            </UpgradeModalProvider>
          </Router>
        </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
