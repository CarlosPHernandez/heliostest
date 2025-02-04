Set up the page structure according to the following prompt:
   
<page-structure-prompt>
Next.js route structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /discover
- /shop
- /investors
- /careers
- /about-us

Page Implementations:
/discover:
Core Purpose: Showcase company products, innovations, and technology
Key Components
- Interactive product showcase carousel
- Technology feature cards
- Video demonstrations
- Innovation timeline
- Newsletter signup
Layout Structure
- Hero section with featured innovation
- Grid layout for technology cards
- Full-width video sections
- Two-column layout for detailed features

/shop:
Core Purpose: E-commerce platform for direct product sales
Key Components
- Product catalog grid
- Filter sidebar
- Search functionality
- Shopping cart
- Product detail modal
Layout Structure
- Sticky filter sidebar (desktop)
- Responsive product grid (3 columns desktop, 2 tablet, 1 mobile)
- Fixed shopping cart icon
- Breadcrumb navigation

/investors:
Core Purpose: Financial information and investor relations
Key Components
- Stock ticker
- Financial reports
- Investor presentations
- Shareholder information
- Corporate governance details
Layout Structure
- Dashboard-style layout
- Split sections for different types of information
- Document repository grid
- Contact information footer

/careers:
Core Purpose: Job listings and company culture showcase
Key Components
- Job search interface
- Department filters
- Application form
- Employee testimonials
- Benefits information
Layout Structure
- Search bar with filters
- Job listings in card format
- Split layout for culture

/about-us:
Core Purpose: Company information and brand story
Key Components
- Company timeline
- Team member profiles
- Mission/Vision statements
- Location map
- Contact form
Layout Structure
- Narrative scroll sections
- Team grid layout
- Full-width impact statements
- Contact section at bottom

Layouts:
MainLayout:
Applicable routes: All routes
Core components
- Global navigation
- Footer
- Breadcrumb navigation
- Mobile menu
Responsive behavior
- Collapsible navigation on mobile
- Sticky header
- Responsive padding and margins
- Mobile-first breakpoints

ShopLayout
Applicable routes: /shop
Core components
- Category navigation
- Cart sidebar
- Filter system
Responsive behavior
- Collapsible filters on mobile
- Sliding cart panel
- Adaptive product grid

CorporateLayout
Applicable routes: /investors, /careers, /about-us
Core components
- Secondary navigation
- Side menu for sections
- Contact information
Responsive behavior
- Collapsed side menu on mobile
- Responsive tables and charts
- Accordion-style information panels
</page-structure-prompt>