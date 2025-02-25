import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Add debugging for environment variables
console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not configured');
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  console.error('NEXT_PUBLIC_BASE_URL is not configured');
  throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
}

// Initialize Stripe with error handling
let stripe: Stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
  console.log('Stripe initialized successfully');
} catch (error) {
  console.error('Error initializing Stripe:', error);
  throw error;
}

// Pricing configuration
const PRODUCTS = {
  'Basic Clean': {
    pricePerPanel: 12,
  },
  'Premium Clean': {
    pricePerPanel: 15,
  },
  'Commercial': {
    pricePerPanel: 20,
  },
};

async function createPrice(productId: string, amount: number): Promise<string> {
  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: amount * 100, // Convert to cents
      currency: 'usd',
    });

    return price.id;
  } catch (error) {
    console.error('Error creating price:', error);
    throw new Error('Failed to create price');
  }
}

async function getOrCreateProduct(productName: string, totalAmount: number): Promise<string> {
  try {
    const product = PRODUCTS[productName as keyof typeof PRODUCTS];
    if (!product) {
      throw new Error('Invalid product selected');
    }

    // List products to find if it exists
    const products = await stripe.products.list({
      limit: 100
    });

    let existingProduct = products.data.find(p => p.name === productName);

    // Create product if it doesn't exist
    if (!existingProduct) {
      existingProduct = await stripe.products.create({
        name: productName,
        metadata: {
          pricePerPanel: product.pricePerPanel.toString()
        }
      });
    }

    // Create a new price for this specific order
    const priceId = await createPrice(existingProduct.id, totalAmount);

    return priceId;
  } catch (error) {
    console.error('Error in getOrCreateProduct:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { priceId, panelCount, totalAmount, appointmentDate, appointmentTime } = await req.json();
    console.log('Received request:', { priceId, panelCount, totalAmount, appointmentDate, appointmentTime });

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error('Missing BASE_URL');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe Secret Key');
    }

    // Input validation
    if (!priceId || !PRODUCTS[priceId as keyof typeof PRODUCTS]) {
      console.error('Invalid product:', priceId);
      return NextResponse.json(
        { error: 'Invalid product selected' },
        { status: 400 }
      );
    }

    if (!panelCount || panelCount <= 0) {
      console.error('Invalid panel count:', panelCount);
      return NextResponse.json(
        { error: 'Invalid panel count' },
        { status: 400 }
      );
    }

    if (panelCount > 100) {
      console.error('Panel count too high:', panelCount);
      return NextResponse.json(
        { error: 'For installations over 100 panels, please contact us directly' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      console.error('Invalid amount:', totalAmount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Verify the amount matches our pricing
    const product = PRODUCTS[priceId as keyof typeof PRODUCTS];
    const expectedAmount = product.pricePerPanel * panelCount;
    if (Math.abs(totalAmount - expectedAmount) > 0.01) {
      console.error(`Amount mismatch. Expected: ${expectedAmount}, Got: ${totalAmount}`);
      return NextResponse.json(
        { error: 'Price calculation mismatch' },
        { status: 400 }
      );
    }

    console.log('Creating/getting product...');
    // Get or create the product and create a new price
    const priceIdCreated = await getOrCreateProduct(priceId, totalAmount);
    console.log('Created price:', priceIdCreated);

    console.log('Creating checkout session...');
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Solar Panel Cleaning - ${priceId}`,
              description: `Cleaning service for ${panelCount} panels\nAppointment: ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}`,
            },
            unit_amount: totalAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/services/solar-panel-cleaning?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/services/solar-panel-cleaning?canceled=true`,
      metadata: {
        panelCount: panelCount.toString(),
        plan: priceIdCreated,
        appointmentDate,
        appointmentTime,
        pricePerPanel: PRODUCTS[priceId as keyof typeof PRODUCTS].pricePerPanel.toString(),
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      }
    });
    console.log('Created session:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 