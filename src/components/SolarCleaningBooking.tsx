import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Calendar } from 'lucide-react';

// Initialize Stripe (you'll need to replace this with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  panelCount: string;
  message: string;
}

const PRICE_PER_PANEL = 10; // Base price per panel in dollars

export default function SolarCleaningBooking() {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    panelCount: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculatePrice = () => {
    const panels = parseInt(formData.panelCount) || 0;
    return panels * PRICE_PER_PANEL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: calculatePrice(),
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          console.error('Stripe error:', error);
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-text mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-text mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-secondary-text mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-secondary-text mb-1">
              Preferred Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-secondary-text mb-1">
            Service Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleInputChange}
            className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
          />
        </div>

        <div>
          <label htmlFor="panelCount" className="block text-sm font-medium text-secondary-text mb-1">
            Number of Solar Panels
          </label>
          <input
            type="number"
            id="panelCount"
            name="panelCount"
            required
            min="1"
            value={formData.panelCount}
            onChange={handleInputChange}
            className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-secondary-text mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleInputChange}
            className="block w-full rounded-xl py-2.5 px-4 text-secondary-text ring-1 ring-inset ring-gray-200 placeholder:text-secondary-text/70 focus:ring-1 focus:ring-gray-300 sm:text-sm sm:leading-6 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:ring-gray-300"
          />
        </div>

        <div className="bg-[#FBFBFB] rounded-xl p-4 ring-1 ring-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-secondary-text">Price per panel:</span>
            <span className="font-medium text-gray-900">${PRICE_PER_PANEL.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span className="text-gray-900">Total Price:</span>
            <span className="text-gray-900">${calculatePrice().toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-black bg-white rounded-xl shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
        >
          {loading ? 'Processing...' : 'Book and Pay Now'}
        </button>
      </form>
    </div>
  );
} 