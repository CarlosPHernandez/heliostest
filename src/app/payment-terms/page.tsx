import React from 'react'

export const metadata = {
  title: 'Payment Terms | Helios Nexus',
  description: 'Payment Terms and Conditions for Helios Nexus - Shaping the Future of Sustainable Energy',
}

export default function PaymentTerms() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-32 sm:px-12 lg:px-16">
      <h1 className="text-4xl font-bold mb-10 text-[#333333]">Payment Terms and Conditions</h1>

      <p className="text-xl text-[#666666] mb-12">
        These payment terms outline the payment process and financing options available to customers of Helios Nexus. By placing an order, customers agree to these terms.
      </p>

      <div className="mb-8">
        <p className="text-[#666666]">Published on: 2024-10-17</p>
        <p className="text-[#666666]">Last Edited on: 2024-10-17</p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">1. Deposit Payment</h2>
          <p className="text-lg text-[#444444]">
            Currently, <strong>Helios Nexus has waived the order deposit</strong>. If deposits are reinstated in the future, payments will only be accepted through our official <strong>payment processing system</strong>.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">2. Payment for Cash Purchases</h2>
          <p className="text-lg text-[#444444]">
            If a customer opts to pay in <strong>cash</strong>, the payment must be made <strong>directly to Helios Nexus</strong>. Specific payment instructions will be provided by our team during the finalization of the order.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">3. Financing Options</h2>
          <p className="text-lg text-[#444444] mb-4">
            Customers who wish to finance their solar panel system have two options:
          </p>
          <ol className="list-decimal pl-6 mb-4 text-lg text-[#444444] space-y-4">
            <li>
              <strong>Self-Financing:</strong>
              <ul className="list-disc pl-6 mt-2 text-lg text-[#444444] space-y-1">
                <li>Customers may secure financing from their own lender and follow the lender's terms and conditions.</li>
              </ul>
            </li>
            <li>
              <strong>Helios Nexus Partner Lenders:</strong>
              <ul className="list-disc pl-6 mt-2 text-lg text-[#444444] space-y-1">
                <li>Customers can apply for financing through our <strong>partner lending institutions</strong>.</li>
                <li>Approval decisions, loan terms, and interest rates are determined solely by the <strong>lender</strong>.</li>
              </ul>
            </li>
          </ol>
          <p className="text-lg text-[#444444]">
            Once approved for financing, customers will make payments <strong>directly to the lending institution</strong>, according to the terms outlined in their loan agreement.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">4. Estimate of Terms and Rates</h2>
          <p className="text-lg text-[#444444]">
            Helios Nexus provides <strong>estimated financing terms and rates</strong> on our website for customer reference. These estimates are <strong>subject to change</strong> and do not represent a final offer or guarantee. The actual terms and rates will be determined by the lending institution at the time of loan approval.
          </p>
          <hr className="my-8 border-gray-200" />
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-6 text-[#333333]">5. Contact Information</h2>
          <p className="text-lg text-[#444444]">
            If you have any questions or need assistance regarding payment or financing, please contact us at:
          </p>
          <p className="text-lg text-[#444444] mt-2">
            <strong>Email:</strong> <a href="mailto:orders@heliosnexus.com" className="text-[#444444] hover:text-[#222222] font-medium">orders@heliosnexus.com</a>
          </p>
        </section>
      </div>
    </div>
  )
} 