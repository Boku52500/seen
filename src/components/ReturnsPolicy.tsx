const ReturnsPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Returns & Exchanges Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: 05 September 2025</p>

        <div className="prose prose-gray max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li><a href="#overview" className="text-black underline">Overview</a></li>
              <li><a href="#return-window" className="text-black underline">Return Window</a></li>
              <li><a href="#non-returnable" className="text-black underline">Non-Returnable Items</a></li>
              <li><a href="#start-return" className="text-black underline">How to Start a Return</a></li>
              <li><a href="#return-shipping" className="text-black underline">Return Shipping Costs</a></li>
              <li><a href="#refunds" className="text-black underline">Refunds</a></li>
              <li><a href="#exchanges" className="text-black underline">Exchanges</a></li>
              <li><a href="#damaged" className="text-black underline">Damaged, Defective, or Incorrect Items</a></li>
              <li><a href="#international-returns" className="text-black underline">International Returns & Customs</a></li>
              <li><a href="#contact" className="text-black underline">Contact</a></li>
            </ul>
          </div>
          <h2 id="overview" className="mt-12 scroll-mt-24">Overview</h2>
          <p>
            We want you to love your Seen Studios purchase. If something isn’t quite right, we’re here to help. This policy explains how returns and exchanges work.
          </p>

          <h2 id="return-window" className="mt-12 scroll-mt-24">Return Window</h2>
          <ul>
            <li>Returns are accepted within 14 days of delivery.</li>
            <li>Items must be in their original condition: unworn, unwashed, with all tags attached and in the original packaging.</li>
            <li>For hygiene reasons, certain items (e.g., intimate apparel, bodysuits, swimwear) are non-returnable unless faulty.</li>
          </ul>

          <h2 id="non-returnable" className="mt-12 scroll-mt-24">Non-Returnable Items</h2>
          <ul>
            <li>Final sale or clearance items.</li>
            <li>Gift cards.</li>
            <li>Customized or made-to-order items, unless defective.</li>
          </ul>

          <h2 id="start-return" className="mt-12 scroll-mt-24">How to Start a Return</h2>
          <ol>
            <li>Submit a request via our <a href="/contact" className="text-black underline">Contact</a> page with your order number and reason for return.</li>
            <li>We will provide return instructions and, where applicable, a return authorization.</li>
            <li>Pack your item securely. Include all original tags and packaging.</li>
          </ol>

          <h2 id="return-shipping" className="mt-12 scroll-mt-24">Return Shipping Costs</h2>
          <p>
            Return shipping costs are the responsibility of the customer unless the item is defective or we made an error. We recommend using a trackable shipping service as we cannot process returns that are lost in transit.
          </p>

          <h2 id="refunds" className="mt-12 scroll-mt-24">Refunds</h2>
          <ul>
            <li>Once your return is received and inspected, we’ll notify you of the approval or rejection.</li>
            <li>If approved, refunds are issued to the original payment method. Processing times vary by bank/payment provider (typically 5–10 business days after we process your return).</li>
            <li>Original shipping fees are non-refundable unless the return is due to our error.</li>
          </ul>

          <h2 id="exchanges" className="mt-12 scroll-mt-24">Exchanges</h2>
          <p>
            For a faster exchange, we recommend placing a new order for the desired item and returning the original item for a refund.
          </p>

          <h2 id="damaged" className="mt-12 scroll-mt-24">Damaged, Defective, or Incorrect Items</h2>
          <p>
            If you receive a damaged, defective, or incorrect item, please contact us within 7 days of delivery with photos and your order number so we can make it right.
          </p>

          <h2 id="international-returns" className="mt-12 scroll-mt-24">International Returns & Customs</h2>
          <p>
            For returns from outside Georgia, please clearly mark the package as "Returned Goods" to avoid customs duties. Any customs fees incurred for returns are the responsibility of the sender.
          </p>

          <h2 id="contact" className="mt-12 scroll-mt-24">Contact</h2>
          <p>
            For any questions about returns or exchanges, please contact us via the <a href="/contact" className="text-black underline">Contact</a> page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicy;
