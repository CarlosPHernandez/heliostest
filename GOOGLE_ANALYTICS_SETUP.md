# Analytics Setup for Helios

This document provides instructions on how to set up and use analytics in the Helios application. We use both Google Analytics and Vercel Analytics for comprehensive tracking.

## Google Analytics Setup

1. **Create a Google Analytics Account**:
   - Go to [Google Analytics](https://analytics.google.com/) and sign in with your Google account.
   - Create a new property for your website.
   - Set up a data stream for your website.
   - Get your Measurement ID (it starts with "G-").

2. **Add the Measurement ID to Environment Variables**:
   - Open your `.env.local` file.
   - Add or update the following line:
     ```
     NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     ```
   - Replace `G-XXXXXXXXXX` with your actual Measurement ID.

3. **Deploy Your Application**:
   - Deploy your application to see the analytics in action.
   - Note that Google Analytics may take up to 24 hours to start showing data.

## Vercel Analytics

Vercel Analytics is already set up in the application using the `@vercel/analytics` package. It provides:

- Web vitals monitoring
- Page view tracking
- Performance metrics
- No configuration required

You can view Vercel Analytics data in your Vercel dashboard under the Analytics tab.

## Using Both Analytics Solutions

Our application uses both Google Analytics and Vercel Analytics for the following reasons:

1. **Complementary Data**: Vercel Analytics focuses on performance metrics and basic usage data, while Google Analytics provides more detailed user behavior insights.
2. **Different Dashboards**: Each platform offers different visualization and reporting tools.
3. **Redundancy**: Having two analytics solutions ensures you don't lose data if one system has issues.

## Google Analytics Usage

### Tracking Page Views

Page views are automatically tracked using the `GoogleAnalytics` component that's included in the root layout.

### Tracking Events

You can track custom events using the `event` function from the analytics library:

```typescript
import { event } from '@/lib/analytics';

// Track a simple event
event('button_click');

// Track an event with additional parameters
event('form_submit', {
  form_name: 'contact_form',
  form_length: 5,
  user_type: 'new_user',
});
```

### Tracking Exceptions

You can track exceptions using the `exception` function:

```typescript
import { exception } from '@/lib/analytics';

try {
  // Your code here
} catch (error) {
  // Track the exception
  exception(error.message, true); // Set to true if it's a fatal error
}
```

## Available Analytics Functions

The following functions are available in the `@/lib/analytics` module:

- `pageview(url: string)`: Track a page view.
- `event(action: string, params?: Record<string, any>)`: Track a custom event.
- `exception(description: string, fatal?: boolean)`: Track an exception.

## Best Practices

1. **Use Descriptive Event Names**: Use clear, descriptive names for your events to make them easier to analyze.
2. **Be Consistent**: Use a consistent naming convention for your events and parameters.
3. **Don't Track PII**: Avoid tracking personally identifiable information (PII) in your events.
4. **Track Important User Interactions**: Focus on tracking interactions that are important for your business goals.
5. **Use Custom Dimensions**: Use custom dimensions to segment your data in meaningful ways.

## Debugging

To verify that Google Analytics is working correctly:

1. Use the Google Analytics Debugger browser extension.
2. Check the Network tab in your browser's developer tools for requests to `google-analytics.com`.
3. Look for the `gtag` function in the browser console.

For Vercel Analytics, check the Network tab for requests to `vitals.vercel-insights.com`.

## Additional Resources

- [Google Analytics Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js with Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics) 