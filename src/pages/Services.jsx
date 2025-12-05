import { Link } from 'react-router-dom';
import {
  FileText,
  Copy,
  BookOpen,
  BookMarked,
  Book,
  Layers,
  Scan,
  Image,
  Building2,
  Palette,
  ArrowLeft,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const services = [
  {
    id: 'document-printing',
    icon: FileText,
    title: 'Document Printing',
    description: 'High-quality printing for documents, reports, presentations, and more. Available in color and black & white.',
  },
  {
    id: 'xerox-copies',
    icon: Copy,
    title: 'Xerox Copies',
    description: 'Fast and reliable photocopying services for all your document duplication needs. Single and double-sided options.',
  },
  {
    id: 'spiral-binding',
    icon: BookOpen,
    title: 'Spiral Binding',
    description: 'Professional spiral binding with plastic coils. Perfect for reports, manuals, and presentations. Available in multiple colors.',
  },
  {
    id: 'soft-binding',
    icon: BookMarked,
    title: 'Soft Binding',
    description: 'Soft cover binding with perfect binding technique. Ideal for booklets, catalogs, and marketing materials.',
  },
  {
    id: 'hard-binding',
    icon: Book,
    title: 'Hard Binding',
    description: 'Premium hardcover binding for books, thesis, and important documents. Durable and professional finish.',
  },
  {
    id: 'lamination',
    icon: Layers,
    title: 'Lamination',
    description: 'Protect your documents with matte or gloss lamination. Available in various thicknesses for durability.',
  },
  {
    id: 'scanning',
    icon: Scan,
    title: 'Scanning',
    description: 'High-resolution document scanning services. Convert physical documents to digital format with OCR support.',
  },
  {
    id: 'photo-printing',
    icon: Image,
    title: 'Photo Printing',
    description: 'Professional photo printing on premium paper. Available in various sizes from wallet to poster formats.',
  },
  {
    id: 'corporate-bulk',
    icon: Building2,
    title: 'Corporate Bulk Orders',
    description: 'Specialized services for bulk printing needs. Competitive pricing for large volume orders with dedicated support.',
  },
  {
    id: 'document-formatting',
    icon: Palette,
    title: 'Document Formatting/Designing',
    description: 'Professional document design and formatting services. Create polished, print-ready documents with expert layout.',
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive range of printing and document services designed to meet all your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                className="p-6 hover:shadow-lg transition-all duration-smooth cursor-pointer group"
              >
                <div className="flex flex-col items-start h-full">
                  {/* Icon */}
                  <div className="mb-4 p-3 bg-primary-light rounded-lg group-hover:bg-primary transition-colors duration-smooth">
                    <IconComponent
                      size={32}
                      className="text-primary group-hover:text-white transition-colors duration-smooth"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-smooth">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                    {service.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-br from-primary-light to-secondary-light">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upload your files and customize your order with our easy-to-use platform
            </p>
            <Link to="/order">
              <Button variant="primary" size="lg">
                Start Your Order
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

