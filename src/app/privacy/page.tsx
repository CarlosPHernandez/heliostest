import React from 'react'

export const metadata = {
  title: 'Privacy Policy | Helios Nexus',
  description: 'Privacy Policy for Helios Nexus - Shaping the Future of Sustainable Energy',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-32 sm:px-12 lg:px-16">
      <h1 className="text-4xl font-bold mb-10 text-[#333333]">Privacy Policy</h1>

      <p className="text-xl text-[#666666] mb-12">
        At Helios Nexus, we value your privacy. This Privacy Policy outlines the types of information we collect, how we use it, and the measures we take to safeguard your data. By using our website, you agree to the terms of this policy.
      </p>

      <div className="mb-8">
        <p className="text-[#666666]">Published on: 2024-10-15</p>
        <p className="text-[#666666]">Last Edited on: 2024-10-15</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">1. Information We Collect</h2>
          <p className="text-lg text-[#444444] mb-4">
            We collect the following information to provide you with solar proposals, ensure effective communication, and deliver high-quality service:
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li><strong>Full Name:</strong> To ensure the order is placed under the correct account holder.</li>
            <li><strong>Address:</strong> To generate accurate solar designs, analyze feasibility, and comply with local permitting and incentive regulations.</li>
            <li><strong>Email Address:</strong> To create a customer profile, provide access to your dashboard (once available), and send order updates.</li>
            <li><strong>Phone Number:</strong> To facilitate direct communication and ensure you receive important updates about your order.</li>
            <li><strong>Average Utility Bill Amount:</strong> To estimate solar energy savings and tailor the proposal to your energy needs.</li>
          </ul>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">2. How We Use Your Information</h2>
          <ol className="list-decimal pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li><strong>Proposal Generation:</strong> Your data is used to generate solar proposals and ensure that designs align with engineering requirements.</li>
            <li><strong>Compliance:</strong> We use your address to meet local regulations for permits and ensure your eligibility for incentives.</li>
            <li><strong>Communication:</strong> We contact you via phone and email to keep you informed of your order's status.</li>
            <li><strong>Customer Dashboard:</strong> Your information helps create a personalized dashboard, giving you access to track orders and manage your profile.</li>
          </ol>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">3. How We Protect Your Information</h2>
          <p className="text-lg text-[#444444]">
            We implement industry-standard security measures to protect your data. Access to your personal information is restricted to authorized personnel only, and we use encryption and other safeguards to prevent unauthorized access.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">4. Cookies</h2>
          <p className="text-lg text-[#444444] mb-4">
            Our website uses cookies to improve your experience and ensure smooth operation. Cookies are small text files stored on your device that help us understand how you use our site. We use:
          </p>
          <ul className="list-disc pl-6 mb-4 text-lg text-[#444444] space-y-2">
            <li><strong>Essential Cookies:</strong> To enable the core functionalities of our website.</li>
            <li><strong>Performance Cookies:</strong> To track site usage and improve performance.</li>
            <li><strong>Functional Cookies:</strong> To remember your preferences for future visits.</li>
          </ul>
          <p className="text-lg text-[#444444]">
            You can control cookie settings through your browser and opt-out of non-essential cookies. However, disabling cookies may affect the functionality of certain website features.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#333333]">Contact Us</h2>
          <p className="text-lg text-[#444444]">
            If you have any questions about our Privacy Policy, please contact us at:
          </p>
          <p className="text-lg text-[#444444] mt-2">
            <strong>Email:</strong> <a href="mailto:Support@heliosnexus.com" className="text-[#444444] hover:text-[#222222] font-medium">Support@heliosnexus.com</a>
          </p>
        </section>
      </div>
    </div>
  )
} 