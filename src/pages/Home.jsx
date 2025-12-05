import { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Upload, File, ChevronRight, ChevronLeft, MapPin, Clock, Star, MessageCircle } from 'lucide-react';
import { dealers } from '../data/dealers';
import Button from '../components/Button';
import Card from '../components/Card';
import Chatbot from '../components/Chatbot';

const dealerWindow = 3;

export default function Home() {
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const fileInputRef = useRef(null);
  const uploadTimerRef = useRef(null);
  const toastShownRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isUrgent, setIsUrgent] = useState(false);
  const [dealerOffset, setDealerOffset] = useState(0);

  const summary = useMemo(() => {
    const base = 420;
    const variable = copies * 12;
    const min = base + variable;
    const max = min + 60 + (isUrgent ? 80 : 0);
    return {
      pages: `${copies * 24} (auto-detected)`,
      cost: `₹ ${min} - ₹ ${max}`,
      ready: isUrgent ? 'Today, 6:30 PM' : 'Today, 7:30 PM',
    };
  }, [copies, isUrgent]);

  const visibleDealers = dealers.slice(dealerOffset, dealerOffset + dealerWindow);

  // Cleanup timer on unmount or when file changes
  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current);
        uploadTimerRef.current = null;
      }
    };
  }, [selectedFile]);

  const handleFileSelection = (file) => {
    // Clean up any existing timer
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
    
    // Reset toast tracking for new file
    toastShownRef.current = false;
    
    setSelectedFile(file);
    setProgress(0);
    if (!file) return;
    setIsUploading(true);
    const totalSteps = 20;
    let step = 0;
    uploadTimerRef.current = setInterval(() => {
      step += 1;
      setProgress(Math.min(100, Math.round((step / totalSteps) * 100)));
      if (step >= totalSteps) {
        // Clear timer
        if (uploadTimerRef.current) {
          clearInterval(uploadTimerRef.current);
          uploadTimerRef.current = null;
        }
        
        // Show toast only once
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          setIsUploading(false);
          toast.success('File uploaded successfully!');
        }
      }
    }, 80);
  };

  const onFileChange = (event) => handleFileSelection(event.target.files[0]);

  const handleDrop = (event) => {
    event.preventDefault();
    const dropped = event.dataTransfer?.files?.[0];
    if (dropped) handleFileSelection(dropped);
  };

  const moveDealers = (direction) => {
    setDealerOffset((current) => {
      if (direction === 'prev') return Math.max(0, current - 1);
      return Math.min(Math.max(0, dealers.length - dealerWindow), current + 1);
    });
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-white to-secondary-light py-20 px-4" id="hero">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-primary font-semibold text-sm uppercase tracking-wide">
                Fast • Friendly • Anytime
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Print Anything, Anytime — Delivered to Your Door
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Same-day document printing with premium finishing from your
                neighborhood Xerox experts. Upload, customize, and relax.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/order">
                  <Button variant="primary" size="lg">
                    Upload & Print Now
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="ghost" size="lg">
                    Explore Services
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <strong className="text-2xl font-bold text-gray-900 block">1K+</strong>
                  <span className="text-sm text-gray-600">Documents daily</span>
                </div>
                <div>
                  <strong className="text-2xl font-bold text-gray-900 block">50+</strong>
                  <span className="text-sm text-gray-600">Verified dealers</span>
                </div>
                <div>
                  <strong className="text-2xl font-bold text-gray-900 block">&lt;90m</strong>
                  <span className="text-sm text-gray-600">Average delivery</span>
                </div>
              </div>
            </div>
            <div>
              <Card>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors duration-smooth cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={onFileChange}
                  />
                  {selectedFile ? (
                    <div>
                      <File size={48} className="mx-auto text-primary mb-4" />
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="font-semibold text-gray-900 mb-2">
                        Drag & drop your file here
                      </p>
                      <p className="text-sm text-gray-600">or click to browse</p>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="w-full mt-6"
                  disabled={!selectedFile}
                  onClick={() => {
                    if (selectedFile) {
                      toast.success('Redirecting to order page...');
                      setTimeout(() => (window.location.href = '/order'), 500);
                    }
                  }}
                >
                  Start Upload
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white" aria-label="How it works">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How PrintEase Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Upload',
                description: 'Securely upload PDFs or Office files from desktop or mobile.',
              },
              {
                step: 2,
                title: 'Customize',
                description: 'Choose paper, color, binding, lamination, finishing, and more.',
              },
              {
                step: 3,
                title: 'Choose dealer',
                description: 'Pick trusted local Xerox partners with live ETA & pricing.',
              },
              {
                step: 4,
                title: 'Get it delivered',
                description: 'Doorstep delivery or instant pickup — you decide every time.',
              },
            ].map((item) => (
              <Card key={item.step} hover className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dealers Section */}
      <section className="py-20 px-4 bg-gray-50" id="dealers">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-2">
                Trusted partners
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Featured dealers near you</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => moveDealers('prev')}
                disabled={dealerOffset === 0}
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => moveDealers('next')}
                disabled={dealerOffset >= dealers.length - dealerWindow}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleDealers.map((dealer) => (
              <Card key={dealer.id} hover>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{dealer.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-sm">{dealer.rating}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-3">{dealer.priceRange}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{dealer.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>ETA {dealer.eta}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dealer.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <Button variant="primary" className="w-full">
                  Select dealer
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-dark text-white" id="chatbot">
        <div className="container mx-auto max-w-4xl text-center">
          <MessageCircle size={48} className="mx-auto mb-6" />
          <p className="text-primary-light font-semibold text-sm uppercase tracking-wide mb-2">
            Need help?
          </p>
          <h2 className="text-3xl font-bold mb-4">Chat with PrintEase Copilot</h2>
          <p className="text-lg text-primary-light mb-8">
            Ask about pricing, bulk orders, paper recommendations, or dealer availability — our AI
            assistant replies instantly.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              const chatbotButton = document.querySelector('[aria-label="Open chatbot"]');
              chatbotButton?.click();
            }}
          >
            Launch Chatbot
          </Button>
        </div>
      </section>

      <Chatbot />
    </main>
  );
}
