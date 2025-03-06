/**
 * Google Analytics utility functions
 */

// Define the window.gtag function
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = 'G-4J1B31H3TM';

/**
 * Track a page view in Google Analytics
 * @param url The URL to track
 */
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
    console.log(`Analytics pageview tracked: ${url}`);
  } else {
    console.warn('Google Analytics not available for pageview tracking');
  }
};

/**
 * Track an event in Google Analytics
 * @param action The action name
 * @param params Additional parameters to track
 */
export const event = (
  action: string,
  params: Record<string, any> = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
    console.log(`Analytics event tracked: ${action}`, params);
  } else {
    console.warn('Google Analytics not available for event tracking');
  }
};

/**
 * Track form interactions
 * @param formName The name of the form
 * @param eventType The type of form event (started, completed, abandoned, etc.)
 * @param data Additional data about the form interaction
 */
export const trackFormInteraction = (
  formName: string,
  eventType: 'view' | 'started' | 'field_interaction' | 'submit_attempt' | 'submit_success' | 'submit_error' | 'abandoned' | 'reset',
  data: Record<string, any> = {}
) => {
  const eventName = `form_${eventType}`;
  event(eventName, {
    form_name: formName,
    ...data
  });
};

/**
 * Track an exception in Google Analytics
 * @param description The exception description
 * @param fatal Whether the exception was fatal
 */
export const exception = (description: string, fatal = false) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description,
      fatal,
    });
    console.log(`Analytics exception tracked: ${description}`, { fatal });
  } else {
    console.warn('Google Analytics not available for exception tracking');
  }
}; 