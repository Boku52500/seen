const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: 05 September 2025</p>

        <div className="prose prose-gray max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li><a href="#who-we-are" className="text-black underline">Who we are</a></li>
              <li><a href="#data-we-collect" className="text-black underline">Personal data we collect</a></li>
              <li><a href="#how-we-use" className="text-black underline">How we use your information</a></li>
              <li><a href="#sharing" className="text-black underline">Sharing your information</a></li>
              <li><a href="#international-transfers" className="text-black underline">International data transfers</a></li>
              <li><a href="#data-retention" className="text-black underline">Data retention</a></li>
              <li><a href="#your-rights" className="text-black underline">Your rights</a></li>
              <li><a href="#security" className="text-black underline">Security</a></li>
              <li><a href="#children" className="text-black underline">Children</a></li>
              <li><a href="#contact" className="text-black underline">Contact us</a></li>
              <li><a href="#changes" className="text-black underline">Changes to this policy</a></li>
            </ul>
          </div>
          <h2 id="who-we-are" className="mt-12 scroll-mt-24">Who we are</h2>
          <p>
            This Privacy Policy describes how we collect, use, and share your personal information when you visit or make a purchase from Seen Studios ("we", "us", "our").
          </p>
          <ul>
            <li><strong>Company name:</strong> Seen Studios</li>
            <li><strong>Identification number:</strong> 405798285</li>
            <li><strong>Registered address:</strong> Ugrekhelidze Street 4, Tbilisi, Georgia</li>
          </ul>

          <h2 id="data-we-collect" className="mt-12 scroll-mt-24">Personal data we collect</h2>
          <p>We collect and process the following categories of personal data:</p>
          <ul>
            <li><strong>Identity & contact data:</strong> name, email address, phone number, billing and shipping addresses.</li>
            <li><strong>Order & transaction data:</strong> products purchased, order dates, order value, currency, payment method (tokenized by our payment provider), delivery preferences.</li>
            <li><strong>Account data:</strong> username, password hashes, preferences, wishlists or favourites.</li>
            <li><strong>Customer support data:</strong> messages you send via our contact form and related correspondence.</li>
            <li><strong>Technical & usage data:</strong> IP address, device information, browser type, pages viewed, referring/exit pages, and timestamps.</li>
            <li><strong>Cookies & similar technologies:</strong> used to operate the site, keep you signed in, remember your cart, and understand site usage. You can control cookies through your browser settings.</li>
          </ul>

          <h2 id="how-we-use" className="mt-12 scroll-mt-24">How we use your information</h2>
          <p>We use your personal data for the following purposes and legal bases:</p>
          <ul>
            <li><strong>To provide our services</strong> (perform our contract with you), including processing orders, payments, shipping, returns, and account management.</li>
            <li><strong>To communicate with you</strong> about your orders, account status, and customer support inquiries (contract/legitimate interests).</li>
            <li><strong>To improve and secure our website</strong> and services, including analytics, troubleshooting, and preventing fraud (legitimate interests).</li>
            <li><strong>To comply with legal obligations</strong> such as tax and accounting rules, and responding to lawful requests.</li>
            <li><strong>Marketing</strong> with your consent or as otherwise permitted by law. You can opt out at any time using the unsubscribe link or by contacting us.</li>
          </ul>

          <h2 id="sharing" className="mt-12 scroll-mt-24">Sharing your information</h2>
          <p>We share personal data with trusted service providers only as necessary to operate our business:</p>
          <ul>
            <li><strong>Payment processors</strong> to securely process payments. We do not store full card details on our servers.</li>
            <li><strong>Shipping and logistics partners</strong> to deliver your orders worldwide.</li>
            <li><strong>IT, hosting, analytics, and security providers</strong> to run and protect our services.</li>
            <li><strong>Professional advisers</strong> (lawyers, accountants) and authorities where required by law.</li>
          </ul>
          <p>We require these recipients to protect your data and use it only for the specified purposes.</p>

          <h2 id="international-transfers" className="mt-12 scroll-mt-24">International data transfers</h2>
          <p>
            We operate globally and may transfer your data to countries with different data protection laws. Where required, we implement appropriate safeguards
            such as contractual protections and only work with reputable providers.
          </p>

          <h2 id="data-retention" className="mt-12 scroll-mt-24">Data retention</h2>
          <p>
            We keep personal data only for as long as necessary for the purposes described above:
          </p>
          <ul>
            <li>Order and tax records: typically 6–10 years as required by applicable law.</li>
            <li>Account data: for the life of your account and a reasonable period thereafter or until you request deletion.</li>
            <li>Support communications: for as long as needed to resolve your request and for internal record-keeping.</li>
            <li>Analytics data: retained for a reasonable period to evaluate trends and improve services.</li>
          </ul>

          <h2 id="your-rights" className="mt-12 scroll-mt-24">Your rights</h2>
          <p>
            Depending on your location, you may have rights such as access, correction, deletion, portability, restriction, or objection to certain processing. You can exercise these rights by contacting us.
          </p>
          <p>
            If you are in a jurisdiction that provides for regulator oversight, you may also lodge a complaint with your local data protection authority.
          </p>

          <h2 id="security" className="mt-12 scroll-mt-24">Security</h2>
          <p>
            We use appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, alteration, and destruction. However, no method of transmission or storage is completely secure.
          </p>

          <h2 id="children" className="mt-12 scroll-mt-24">Children</h2>
          <p>
            Our services are not directed to children under 13, and we do not knowingly collect personal data from children. If you believe a child has provided us personal data, please contact us so we can delete it.
          </p>

          <h2 id="contact" className="mt-12 scroll-mt-24">Contact us</h2>
          <p>
            The easiest way to contact us is via the <a href="/contact" className="text-black underline">Contact</a> page. You can also reach us by post at: Seen Studios, Ugrekhelidze Street 4, Tbilisi, Georgia.
          </p>

          <h2 id="changes" className="mt-12 scroll-mt-24">Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes to our practices or for legal, operational, or regulatory reasons. Please review this page periodically for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
