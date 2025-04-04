/**
 * Onboarding Module Index
 * Exports the Onboarding functionality
 */

// Import Onboarding component
import './Onboarding.js';

// Initialize Onboarding when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initOnboarding === 'function') {
        initOnboarding();
    }
});

// Export initialization function for manual initialization
export const startOnboardingTutorial = () => {
    if (typeof startOnboarding === 'function') {
        startOnboarding();
    }
};