import { notFound } from 'next/navigation';
import BookingCalendar from '@/components/BookingCalendar';

// Mock fetch from Booking/Postcode Microservice
const services = [
  { slug: 'weekly-office-deep-clean', name: 'Weekly Office Deep Clean', price: 899, areas: ['NSW', 'VIC', 'QLD'] },
  { slug: 'medical-compliance-cleaning', name: 'Medical Compliance Cleaning', price: 1299, areas: ['NSW', 'VIC', 'QLD', 'WA'] },
  { slug: 'industrial-warehouse-cleaning', name: 'Industrial Warehouse Cleaning', price: 1599, areas: ['NSW', 'VIC'] },
  { slug: 'carpet-floor-maintenance', name: 'Carpet & Floor Maintenance', price: 599, areas: ['NSW', 'VIC', 'QLD', 'SA'] },
];

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = services.find(s => s.slug === params.slug);
  if (!service) return {};
  return {
    title: `${service.name} Australia | PrimeClean`,
    description: `Professional ${service.name.toLowerCase()} across NSW, VIC, QLD. Fully insured, police-checked staff. Instant quotes.`,
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = services.find(s => s.slug === params.slug);
  if (!service) notFound();

  // LocalBusiness + Service Schema for Google Business & Local Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": service.name,
    "provider": {
      "@type": "LocalBusiness",
      "name": "PrimeClean Australia",
      "additionalType": "https://schema.org/CleaningService",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "AU"
      },
      "telephone": "+61-1300-PRIMECLEAN",
      "priceRange": "$$"
    },
    "areaServed": [
      { "@type": "State", "name": "New South Wales" },
      { "@type": "State", "name": "Victoria" },
      { "@type": "State", "name": "Queensland" }
    ],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "AUD",
      "price": service.price,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold">{service.name}</h1>
        <p className="mt-4 text-lg text-gray-600">
          From ${service.price} / session. Available in {service.areas.join(', ')}.
        </p>
        
        <div className="mt-8 p-6 border rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Book Your Service</h2>
          <BookingCalendar serviceId={service.slug} postcode="2000" />
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">What's Included</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Fully insured staff</li>
              <li>✓ Police-checked personnel</li>
              <li>✓ Eco-friendly cleaning products</li>
              <li>✓ Satisfaction guarantee</li>
            </ul>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">Compliance Standards</h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ AS/NZS 4146:2000 compliant</li>
              <li>✓ NHMRC Guidelines followed</li>
              <li>✓ WorkSafe Victoria approved</li>
              <li>✓ Australian GST included</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
