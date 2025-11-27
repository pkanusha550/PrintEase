import { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Upload, File, X, ChevronRight, MapPin, Clock, Star, Check } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { dealers } from '../data/dealers';

const BINDING_OPTIONS = [
  { id: 'spiral', name: 'Spiral Binding', description: 'Plastic coil binding', price: 50 },
  { id: 'wiro', name: 'Wiro Binding', description: 'Wire-O binding', price: 60 },
  { id: 'stapled', name: 'Stapled', description: 'Simple stapling', price: 20 },
  { id: 'perfect', name: 'Perfect Bound', description: 'Glued spine', price: 80 },
  { id: 'hardcover', name: 'Hardcover Binding', description: 'Premium hardcover', price: 200 },
  { id: 'saddle', name: 'Saddle Stitch', description: 'Booklet style', price: 30 },
];

export default function Order() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const toast = context?.toast || { success: () => {}, error: () => {} };
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [orderData, setOrderData] = useState({
    paperSize: 'A4',
    paperType: '80 GSM Matte',
    printStyle: 'Color, double-sided',
    binding: '',
    finishing: 'None',
    copies: 1,
    urgent: false,
  });
  const [selectedDealer, setSelectedDealer] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
      setIsUploading(true);
      
      // Simulate upload
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            toast.success('File uploaded successfully!');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleNext = () => {
    if (step === 1 && !selectedFile) {
      toast.error('Please upload a file first');
      return;
    }
    if (step === 2 && !orderData.binding) {
      toast.error('Please select a binding option');
      return;
    }
    if (step === 3 && !selectedDealer) {
      toast.error('Please select a dealer');
      return;
    }
    setStep(step + 1);
  };

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!', { title: 'Order Confirmed' });
    setTimeout(() => navigate('/my-orders'), 1500);
  };

  const calculateCost = () => {
    const base = 420;
    const bindingCost = BINDING_OPTIONS.find(b => b.id === orderData.binding)?.price || 0;
    const copies = orderData.copies || 1;
    const min = base + (bindingCost * copies) + (orderData.urgent ? 80 : 0);
    const max = min + 60;
    return { min, max };
  };

  const cost = calculateCost();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-smooth ${
                      step >= s
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > s ? <Check size={20} /> : s}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 hidden sm:block">
                    {s === 1 ? 'Upload' : s === 2 ? 'Customize' : s === 3 ? 'Dealer' : 'Review'}
                  </span>
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-smooth ${
                      step > s ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Upload Your File</h2>
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
                    onChange={(e) => handleFileSelect(e.target.files[0])}
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
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {step === 2 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Customize Your Order</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Size
                    </label>
                    <select
                      value={orderData.paperSize}
                      onChange={(e) => setOrderData({ ...orderData, paperSize: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option>A4</option>
                      <option>A3</option>
                      <option>Letter</option>
                      <option>Legal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Type
                    </label>
                    <select
                      value={orderData.paperType}
                      onChange={(e) => setOrderData({ ...orderData, paperType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option>80 GSM Matte</option>
                      <option>100 GSM Premium</option>
                      <option>Recycled</option>
                      <option>Glossy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Print Style
                    </label>
                    <select
                      value={orderData.printStyle}
                      onChange={(e) => setOrderData({ ...orderData, printStyle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option>Color, double-sided</option>
                      <option>Color, single-sided</option>
                      <option>B&W, double-sided</option>
                      <option>B&W, single-sided</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Binding Options
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {BINDING_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-smooth hover:border-primary ${
                            orderData.binding === option.id
                              ? 'border-primary bg-primary-light'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="binding"
                            value={option.id}
                            checked={orderData.binding === option.id}
                            onChange={(e) =>
                              setOrderData({ ...orderData, binding: e.target.value })
                            }
                            className="sr-only"
                          />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{option.name}</p>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                            <span className="text-primary font-semibold">₹{option.price}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finishing
                    </label>
                    <select
                      value={orderData.finishing}
                      onChange={(e) => setOrderData({ ...orderData, finishing: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option>None</option>
                      <option>Matte Lamination</option>
                      <option>Gloss Lamination</option>
                      <option>UV Coat</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Copies
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={orderData.copies}
                        onChange={(e) =>
                          setOrderData({ ...orderData, copies: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orderData.urgent}
                      onChange={(e) => setOrderData({ ...orderData, urgent: e.target.checked })}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-gray-700">Urgent priority (+₹80)</span>
                  </label>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Select a Dealer</h2>
                <div className="space-y-4">
                  {dealers.map((dealer) => (
                    <div
                      key={dealer.id}
                      onClick={() => setSelectedDealer(dealer.id)}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-smooth hover:shadow-card ${
                        selectedDealer === dealer.id
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{dealer.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{dealer.rating}</span>
                          </div>
                        </div>
                        {selectedDealer === dealer.id && (
                          <div className="bg-primary text-white rounded-full p-1">
                            <Check size={20} />
                          </div>
                        )}
                      </div>
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
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        {dealer.priceRange}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dealer.badges.map((badge) => (
                          <span
                            key={badge}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">File</h3>
                    <p className="text-gray-600">{selectedFile?.name}</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Print Settings</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>Paper: {orderData.paperSize} - {orderData.paperType}</p>
                      <p>Style: {orderData.printStyle}</p>
                      <p>Binding: {BINDING_OPTIONS.find(b => b.id === orderData.binding)?.name || 'None'}</p>
                      <p>Finishing: {orderData.finishing}</p>
                      <p>Copies: {orderData.copies}</p>
                      {orderData.urgent && <p className="text-primary">Urgent Priority</p>}
                    </div>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Selected Dealer</h3>
                    <p className="text-gray-600">
                      {dealers.find(d => d.id === selectedDealer)?.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Total Cost</h3>
                    <p className="text-2xl font-bold text-primary">
                      ₹{cost.min} - ₹{cost.max}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              {step < 4 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next <ChevronRight size={20} className="ml-2" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages</span>
                  <span className="font-semibold">48 (auto-detected)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="font-semibold text-primary">
                    ₹{cost.min} - ₹{cost.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ready by</span>
                  <span className="font-semibold">
                    {orderData.urgent ? 'Today, 6:30 PM' : 'Today, 7:30 PM'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                You can adjust everything before paying.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

