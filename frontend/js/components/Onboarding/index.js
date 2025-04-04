/**
 * Onboarding Module Index
 * Provides the Onboarding functionality
 */

// Initialize Onboarding when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initOnboarding === 'function') {
        initOnboarding();
    }
});

// Initialize function for manual initialization
window.startOnboardingTutorial = () => {
    if (typeof startOnboarding === 'function') {
        startOnboarding();
    }
};