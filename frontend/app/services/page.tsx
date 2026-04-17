import Link from 'next/link';

const services = [
  { slug: 'weekly-office-deep-clean', name: 'Weekly Office Deep Clean', price: 899, description: 'Professional office cleaning with eco-friendly products' },
  { slug: 'medical-compliance-cleaning', name: 'Medical Compliance Cleaning', price: 1299, description: 'Hospital-grade cleaning meeting Australian standards' },
  { slug: 'industrial-warehouse-cleaning', name: 'Industrial Warehouse Cleaning', price: 1599, description: 'Heavy-duty industrial cleaning solutions' },
  { slug: 'carpet-floor-maintenance', name: 'Carpet & Floor Maintenance', price: 599, description: 'Complete floor care and maintenance services' },
];

export default function ServicesPage() {
  return (
    <main className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Our Cleaning Services</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Link 
            key={service.slug}
            href={`/services/${service.slug}`}
            className="p-6 border rounded-xl hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{service.name}</h2>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="text-prime-600 font-semibold">From ${service.price} AUD</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
