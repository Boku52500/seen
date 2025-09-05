const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: 05 September 2025</p>

        <div className="prose prose-gray max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li><a href="#about" className="text-black underline">About Us</a></li>
              <li><a href="#agreement" className="text-black underline">Agreement to Terms</a></li>
              <li><a href="#eligibility" className="text-black underline">Eligibility & Accounts</a></li>
              <li><a href="#products" className="text-black underline">Products, Orders, and Pricing</a></li>
              <li><a href="#payments" className="text-black underline">Payments</a></li>
              <li><a href="#shipping" className="text-black underline">Shipping</a></li>
              <li><a href="#returns" className="text-black underline">Returns & Exchanges</a></li>
              <li><a href="#ip" className="text-black underline">Intellectual Property</a></li>
              <li><a href="#conduct" className="text-black underline">User Conduct</a></li>
              <li><a href="#disclaimers" className="text-black underline">Disclaimers</a></li>
              <li><a href="#liability" className="text-black underline">Limitation of Liability</a></li>
              <li><a href="#law" className="text-black underline">Governing Law</a></li>
              <li><a href="#changes" className="text-black underline">Changes to Terms</a></li>
              <li><a href="#contact" className="text-black underline">Contact</a></li>
            </ul>
          </div>
          <h2 id="about" className="mt-12 scroll-mt-24">About Us</h2>
          <ul>
            <li><strong>Company name:</strong> Seen Studios</li>
            <li><strong>Identification number:</strong> 405798285</li>
            <li><strong>Registered address:</strong> Ugrekhelidze Street 4, Tbilisi, Georgia</li>
          </ul>

          <h2 id="agreement" className="mt-12 scroll-mt-24">Agreement to Terms</h2>
          <p>
            By accessing or using our website and services, you agree to be bound by these Terms of Service and our related policies, including the Privacy Policy, Shipping Policy, and Returns Policy.
          </p>

          <h2 id="eligibility" className="mt-12 scroll-mt-24">Eligibility & Accounts</h2>
          <p>
            You must be at least the age of majority in your jurisdiction to purchase from us. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
          </p>

          <h2 id="products" className="mt-12 scroll-mt-24">Products, Orders, and Pricing</h2>
          <ul>
            <li>All product descriptions and prices are subject to change at any time without notice.</li>
            <li>We reserve the right to limit quantities or refuse any order at our sole discretion.</li>
            <li>In the event of pricing or availability errors, we may cancel or adjust orders after notifying you.</li>
            <li>All prices are shown in the currency indicated at checkout. Taxes and shipping costs are calculated at checkout where applicable.</li>
          </ul>

          <h2 id="payments" className="mt-12 scroll-mt-24">Payments</h2>
          <p>
            We use secure third-party payment processors. By submitting payment information, you represent and warrant that you are authorized to use the designated payment method.
          </p>

          <h2 id="shipping" className="mt-12 scroll-mt-24">Shipping</h2>
          <p>
            We offer worldwide shipping. Typical delivery times are 7–10 business days after dispatch, subject to processing times, carrier performance, and customs clearance. See our <a href="/shipping" className="text-black underline">Shipping Policy</a> for full details.
          </p>

          <h2 id="returns" className="mt-12 scroll-mt-24">Returns & Exchanges</h2>
          <p>
            Returns are accepted in accordance with our <a href="/returns" className="text-black underline">Returns Policy</a>. Items must be returned in original condition, unworn, unwashed, with tags attached and in original packaging, unless defective.
          </p>

          <h2 id="ip" className="mt-12 scroll-mt-24">Intellectual Property</h2>
          <p>
            All content on this site, including trademarks, logos, images, text, and design, is owned by or licensed to Seen Studios and is protected by applicable intellectual property laws. You may not use, reproduce, or distribute any content without our prior written consent.
          </p>

          <h2 id="conduct" className="mt-12 scroll-mt-24">User Conduct</h2>
          <p>
            You agree not to misuse the site, including by attempting to gain unauthorized access, interfering with security features, or engaging in fraudulent or unlawful activity.
          </p>

          <h2 id="disclaimers" className="mt-12 scroll-mt-24">Disclaimers</h2>
          <p>
            Our products and services are provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2 id="liability" className="mt-12 scroll-mt-24">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Seen Studios and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits or revenues, whether incurred directly or indirectly.
          </p>

          <h2 id="law" className="mt-12 scroll-mt-24">Governing Law</h2>
          <p>
            These Terms are governed by the laws of Georgia, without regard to conflict of laws principles. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Tbilisi, Georgia.
          </p>

          <h2 id="changes" className="mt-12 scroll-mt-24">Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Changes are effective when posted on this page. Your continued use of the site after changes are posted constitutes acceptance of the updated Terms.
          </p>

          <h2 id="contact" className="mt-12 scroll-mt-24">Contact</h2>
          <p>
            For questions regarding these Terms, please contact us via the <a href="/contact" className="text-black underline">Contact</a> page or by post at the address above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
