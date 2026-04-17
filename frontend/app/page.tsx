import ParticleBackground from '@/components/ParticleBackground';

export default function Home() {
  return (
    <>
      <ParticleBackground />
      <main className="max-w-7xl mx-auto px-4 py-12 relative">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Professional Cleaning Services Across Australia</h1>
        <p className="text-xl text-gray-600 mb-8">
          Fully insured, police-checked staff. Instant quotes. 24/7 support.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/services"
            className="bg-prime-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-prime-700 transition"
          >
            Get a Quote
          </a>
          <a
            href="/contact"
            className="border border-prime-600 text-prime-600 px-6 py-3 rounded-lg font-medium hover:bg-prime-50 transition"
          >
            Contact Us
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Office Cleaning</h3>
          <p className="text-gray-600">Professional deep cleaning for commercial spaces across NSW, VIC, QLD.</p>
        </div>
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Medical Cleaning</h3>
          <p className="text-gray-600">Compliant medical facility cleaning meeting Australian health standards.</p>
        </div>
        <div className="p-6 border rounded-xl">
          <h3 className="text-xl font-semibold mb-2">Industrial Cleaning</h3>
          <p className="text-gray-600">Heavy-duty industrial and warehouse cleaning services.</p>
        </div>
      </section>
    </main>
    </>
  );
}
