import React from 'react'

export const metadata = {
  title: 'Order Terms | Helios Nexus',
  description: 'Order Terms and Conditions for Helios Nexus - Shaping the Future of Sustainable Energy',
}

export default function OrderTerms() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-32 sm:px-12 lg:px-16">
      <h1 className="text-4xl font-bold mb-10 text-[#333333]">Order Terms and Conditions</h1>

      <p className="text-xl text-[#666666] mb-12">
        These terms govern the placement, fulfillment, and cancellation of solar panel system orders from Helios Nexus. By submitting an order through our platform, the customer agrees to these terms.
      </p>

      <div className="mb-8">
        <p className="text-[#666666]">Published on: 2024-10-17</p>
        <p className="text-[#666666]">Last Edited on: 2024-10-17</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">1. Agreement to Purchase</h2>
          <p className="text-lg text-[#444444] mb-4">
            By placing an <strong>order</strong>, the customer agrees to purchase a solar panel system from Helios Nexus. The order will be finalized upon installation of the solar system on the customer's property. Installation is defined as the placement of solar panels on the home's roof, marking the point of delivery.
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li>Any new equipment, features, or product upgrades released after the order is placed <strong>cannot be added</strong> to the system.</li>
            <li>The final purchase will be subject to the availability of required permits and site conditions that allow for proper installation.</li>
          </ul>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">2. Order Pricing</h2>
          <p className="text-lg text-[#444444] mb-4">
            Helios Nexus only accepts orders online through <a href="https://www.heliosnexus.com" className="text-blue-600 hover:underline">HeliosNexus.com</a>. The pricing provided at the time of order is an <strong>estimate</strong> and is subject to change based on several key factors, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li><strong>State and Local Taxes</strong> relevant to the customer's location.</li>
            <li><strong>Federal Tax Credit (30%)</strong>, which will be applied to the final price.</li>
            <li><strong>Battery Systems</strong>, as they also qualify for additional tax credits.</li>
            <li><strong>State-Specific Fees and Incentives</strong>, which vary by location.</li>
            <li><strong>Structural Modifications</strong> required to accommodate the solar system on the home.</li>
          </ul>
          <p className="text-lg text-[#444444]">
            Once the final pricing is determined, Helios Nexus will provide the customer with an updated <strong>price sheet via email</strong>. Customers will eventually have access to a personal <strong>customer profile</strong> to review their order details once the dashboard becomes available.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">3. Final Specification and Price Sheet</h2>
          <p className="text-lg text-[#444444] mb-4">
            Once the order is placed, the <strong>final specification and price sheet</strong> will be sent to the customer by a Helios Nexus representative through email.
          </p>
          <p className="text-lg text-[#444444] mb-4">
            If the customer wishes to modify the design, they must submit a <strong>request</strong> for changes. These requests will be evaluated by our engineering team.
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li><strong>Minor Changes:</strong> Adjustments that do not affect the system's overall design or capacity.</li>
            <li><strong>Major Changes:</strong> Adjustments requiring significant redesigns, such as adding battery systems or increasing panel count.</li>
          </ul>
          <p className="text-lg text-[#444444] mb-4">
            Once changes are reviewed, Helios Nexus will provide the <strong>final spec and pricing</strong> to the customer for approval. The customer can either:
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li><strong>Approve</strong> the final spec sheet, moving the order forward, or</li>
            <li><strong>Dismiss</strong> the design, canceling the order before the final purchase agreement is signed.</li>
          </ul>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">4. Cancellation Policy</h2>
          <p className="text-lg text-[#444444] mb-4">
            Customers may cancel their order <strong>before signing the final purchase agreement and financing documents</strong>.
          </p>
          <p className="text-lg text-[#444444] mb-4">
            <strong>Cancellation Process:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li>Written notice of cancellation must be sent to Helios Nexus via email.</li>
            <li>Deposits will be refunded to the original payment method within <strong>7-10 business days</strong> of receiving the cancellation notice.</li>
          </ul>
          <p className="text-lg text-[#444444]">
            Once the <strong>final purchase agreement and financing documents</strong> are signed, cancellation will be governed by the terms specified in those agreements.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">5. Site Surveys and Order Cancellation</h2>
          <p className="text-lg text-[#444444] mb-4">
            To ensure the location is suitable for solar installation, Helios Nexus will conduct either a <strong>virtual</strong> or <strong>physical site survey</strong>.
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li>The type of survey will depend on the location and will be communicated to the customer in advance.</li>
            <li>The survey is essential to confirm system feasibility and ensure compliance with installation requirements.</li>
          </ul>
          <p className="text-lg text-[#444444]">
            Helios Nexus reserves the right to <strong>cancel the order at any time</strong> during this process if the site is determined to be unsuitable or if unforeseen issues arise.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">6. Delivery Process</h2>
          <p className="text-lg text-[#444444] mb-4">
            Once the final specification is confirmed and the order is approved, Helios Nexus will initiate the <strong>delivery process</strong>, which includes securing all necessary permits and interconnection agreements.
          </p>
          <p className="text-lg text-[#444444]">
            Customers will eventually be able to track their order progress and status through a <strong>customer dashboard</strong>, which is currently under development. Until the dashboard is live, all updates will be communicated through <strong>email</strong>.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">7. Liability Disclaimer</h2>
          <p className="text-lg text-[#444444] mb-4">
            By placing an order, the customer acknowledges and agrees to the following:
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li>Helios Nexus shall not be held liable for any <strong>financial losses, damages, or disputes</strong> arising from the deposit or order process.</li>
            <li>The customer assumes all risks associated with placing the deposit and proceeding with the order.</li>
          </ul>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">8. Choice of Law and Jurisdiction</h2>
          <p className="text-lg text-[#444444] mb-4">
            This agreement will be governed by the <strong>laws of the state</strong> associated with the customer's address at the time of the order.
          </p>
          <p className="text-lg text-[#444444]">
            Any disputes will be resolved exclusively in the <strong>state courts</strong> located in the same state, and both Helios Nexus and the customer consent to the jurisdiction of these courts.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">9. Contact Information</h2>
          <p className="text-lg text-[#444444]">
            If you have any questions or concerns regarding these terms, please contact us at:
          </p>
          <p className="text-lg text-[#444444] mt-2">
            <strong>Email:</strong> <a href="mailto:orders@heliosnexus.com" className="text-[#444444] hover:text-[#222222] font-medium">orders@heliosnexus.com</a>
          </p>
        </section>
      </div>
    </div>
  )
} 