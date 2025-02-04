Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files except prompt.md.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

Set up the frontend according to the following prompt:
<frontend-prompt>
Create detailed components with these requirements:
1. Use 'use client' directive for client-side components
2. Make sure to concatenate strings correctly using backslash
3. Style with Tailwind CSS utility classes for responsive design
4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
7. Create root layout.tsx page that wraps necessary navigation items to all pages
8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
9. Accurately implement necessary grid layouts
10. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping

<summary_title>
Solar Energy Solution Landing Page with Cost Calculator
</summary_title>

<image_analysis>

1. Navigation Elements:
- Top header navigation with: Discover, Shop, Investors, Careers, About Us
- CTA button "Order" in black
- Logo "Helios Nexus" on left


2. Layout Components:
- Full-width hero section (100vw)
- Centered content container (max-width: 1200px)
- Input form container (width: ~400px)
- Navigation height: ~60px


3. Content Sections:
- Hero headline "Solar Made Simple."
- Subheadline text
- Calculator input section
- Privacy notice text
- Background image of solar panels on roof


4. Interactive Controls:
- Numeric input field for electricity cost
- Arrow button for form submission
- Navigation menu items with hover states
- Order CTA button


5. Colors:
- Primary: #000000 (Black CTA)
- Secondary: #FFFFFF (White text)
- Background: Light blue gradient overlay
- Text: #333333 (Dark gray)
- Input field: #FFFFFF (White)


6. Grid/Layout Structure:
- Single column hero layout
- Centered content alignment
- Form elements in flex container
- Responsive padding: 24px mobile, 48px desktop
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Header
│   │   ├── Hero
│   │   └── Calculator
│   ├── features/
│   │   ├── CostCalculator
│   │   └── Navigation
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```


2. Key Features:
- Cost calculator functionality
- Form validation and submission
- Responsive image handling
- Navigation state management


3. State Management:
```typescript
interface AppState {
├── calculator: {
│   ├── monthlyBill: number
│   ├── isSubmitting: boolean
│   └── error: string | null
├── }
├── navigation: {
│   ├── isMenuOpen: boolean
│   └── activePage: string
├── }
}
```


4. Routes:
```typescript
const routes = [
├── '/',
├── '/discover/*',
├── '/shop/*',
├── '/investors/*',
├── '/careers/*',
└── '/about-us/*'
]
```


5. Component Architecture:
- Header (Navigation + Logo)
- Hero (Background + Content)
- Calculator (Form + Submit)
- Shared components (Button, Input)


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
```
</development_planning>
</frontend-prompt>

IMPORTANT: Please ensure that (1) all KEY COMPONENTS and (2) the LAYOUT STRUCTURE are fully implemented as specified in the requirements. Ensure that the color hex code specified in image_analysis are fully implemented as specified in the requirements.