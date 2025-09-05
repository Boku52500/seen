const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: 05 September 2025</p>

        <div className="prose prose-gray max-w-none">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li><a href="#about" className="text-black underline">About Seen Studios</a></li>
              <li><a href="#where-we-ship" className="text-black underline">Where We Ship</a></li>
              <li><a href="#delivery-times" className="text-black underline">Delivery Timeframes</a></li>
              <li><a href="#processing" className="text-black underline">Processing Times</a></li>
              <li><a href="#tracking" className="text-black underline">Tracking</a></li>
              <li><a href="#fees" className="text-black underline">Shipping Fees</a></li>
              <li><a href="#customs" className="text-black underline">Customs, Duties, and Taxes</a></li>
              <li><a href="#delivery-issues" className="text-black underline">Delivery Issues</a></li>
              <li><a href="#restrictions" className="text-black underline">Restrictions</a></li>
              <li><a href="#returns" className="text-black underline">Returns & Exchanges</a></li>
              <li><a href="#contact" className="text-black underline">Contact</a></li>
            </ul>
          </div>
          <h2 id="about" className="mt-12 scroll-mt-24">About Seen Studios</h2>
          <ul>
            <li><strong>Company name:</strong> Seen Studios</li>
            <li><strong>Identification number:</strong> 405798285</li>
            <li><strong>Registered address:</strong> Ugrekhelidze Street 4, Tbilisi, Georgia</li>
          </ul>

          <h2 id="where-we-ship" className="mt-12 scroll-mt-24">Where We Ship</h2>
          <p>
            We offer worldwide shipping. Delivery times may vary depending on destination, courier performance, and customs processing.
          </p>

          <h2 id="delivery-times" className="mt-12 scroll-mt-24">Delivery Timeframes</h2>
          <ul>
            <li>
              Standard delivery typically arrives within <strong>7–10 business days</strong> after dispatch for most destinations.
            </li>
            <li>
              During peak seasons, promotional periods, or due to customs delays, delivery may take longer.
            </li>
          </ul>

          <h2 id="processing" className="mt-12 scroll-mt-24">Processing Times</h2>
          <p>
            Orders are usually processed within 1–3 business days. Orders placed on weekends or public holidays are processed on the next business day.
          </p>

          <h2 id="tracking" className="mt-12 scroll-mt-24">Tracking</h2>
          <p>
            Once your order has shipped, you’ll receive a shipping confirmation email with tracking details (where available). Tracking updates may take 24–48 hours to appear.
          </p>

          <h2 id="fees" className="mt-12 scroll-mt-24">Shipping Fees</h2>
          <p>
            Shipping costs are calculated at checkout based on destination and order size/weight. From time to time, we may offer promotions that include reduced or free shipping.
          </p>

          <h2 id="customs" className="mt-12 scroll-mt-24">Customs, Duties, and Taxes</h2>
          <p>
            International shipments may be subject to import duties and taxes levied by the destination country. These charges are the responsibility of the recipient and are not included in the item price or shipping cost.
          </p>

          <h2 id="delivery-issues" className="mt-12 scroll-mt-24">Delivery Issues</h2>
          <ul>
            <li>
              <strong>Incorrect Address:</strong> Please ensure your address details are correct at checkout. We are not responsible for non-delivery due to errors in the address provided.
            </li>
            <li>
              <strong>Missed Delivery/Unclaimed Parcels:</strong> If a parcel is returned to us due to unsuccessful delivery attempts or non-collection, we can reship at your request (additional shipping charges may apply).
            </li>
            <li>
              <strong>Lost or Damaged in Transit:</strong> Please contact us promptly if your order appears lost or arrives damaged. We’ll work with the carrier to resolve the issue.
            </li>
          </ul>

          <h2 id="restrictions" className="mt-12 scroll-mt-24">Restrictions</h2>
          <ul>
            <li>We may be unable to ship to certain locations due to carrier or regulatory restrictions.</li>
            <li>Some carriers may not deliver to P.O. Boxes. If applicable, please provide a physical address.</li>
          </ul>

          <h2 id="returns" className="mt-12 scroll-mt-24">Returns & Exchanges</h2>
          <p>
            If you need to return an item, please refer to our <a href="/returns" className="text-black underline">Returns & Exchanges Policy</a> for full instructions.
          </p>

          <h2 id="contact" className="mt-12 scroll-mt-24">Contact</h2>
          <p>
            For any shipping questions, please contact us via the <a href="/contact" className="text-black underline">Contact</a> page. Our team will be happy to assist you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
