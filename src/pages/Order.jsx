import { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Upload, File, X, ChevronRight, MapPin, Clock, Star, Check, CreditCard, Wallet, Building2, Map } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import MapView from '../components/MapView';
import { dealers } from '../data/dealers';
import { processPayment, validatePaymentData } from '../services/paymentService';
import { getCurrentLocation, sortDealersByDistance } from '../services/locationService';
import { saveFile, getFile, formatFileSize, needsReupload } from '../services/fileStorageService';
import { createBatch } from '../services/orderBatchService';

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
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    bankCode: '',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortedDealers, setSortedDealers] = useState(dealers);
  const [showMapView, setShowMapView] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);
  const fileInputRef = useRef(null);

  // Get user location and sort dealers on mount
  useEffect(() => {
    getCurrentLocation().then((location) => {
      setUserLocation(location);
      const sorted = sortDealersByDistance(dealers, location.lat, location.lon);
      setSortedDealers(sorted);
    }).catch(() => {
      // Use default dealers if location unavailable
      setSortedDealers(dealers);
    });
  }, []);

  const handleFileSelect = async (file) => {
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
      setIsUploading(true);
      
      try {
        // Save file using improved storage strategy
        const metadata = await saveFile(file);
        setFileMetadata(metadata);
        
        // Simulate upload progress
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
      } catch (error) {
        console.error('Error saving file:', error);
        toast.error('Error saving file. Please try again.');
        setIsUploading(false);
      }
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

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Validate payment data
    const validation = validatePaymentData(paymentMethod, paymentData);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const amount = cost.min * 100; // Convert to paise
      const result = await processPayment(paymentMethod, paymentData, amount);

      if (result.success) {
        // Get current user ID
        const currentUserStr = localStorage.getItem('printease_currentUser');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

        // Create order object
        const order = {
          id: `PE-${Date.now()}`,
          title: selectedFile?.name || 'Print Order',
          file: selectedFile?.name,
          fileId: fileMetadata?.id || null, // Reference to stored file metadata
          fileMetadata: fileMetadata, // Store file metadata with order
          status: 'Pending',
          statusKey: 'pending',
          dealer: sortedDealers.find(d => d.id === selectedDealer)?.name || dealers.find(d => d.id === selectedDealer)?.name || 'Unknown',
          dealerId: selectedDealer,
          price: `₹${cost.min}`,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          paymentStatus: 'Paid',
          paymentMethod: result.paymentMethod,
          transactionId: result.transactionId,
          orderData: { ...orderData },
          cost: cost.min,
          pages: 48, // Auto-detected
          eta: orderData.urgent ? 'Today, 6:30 PM' : 'Today, 7:30 PM',
          userId: currentUser?.id || null,
          changeLog: [], // Initialize change log
          auditLog: [], // Initialize audit log
          messages: [], // Initialize messages array for chat
        };

        // Save to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('printease_orders') || '[]');
        existingOrders.unshift(order);
        localStorage.setItem('printease_orders', JSON.stringify(existingOrders));

        // Note: For batch support, multiple orders can be created and grouped
        // Example: createBatch([order1, order2, order3])

        toast.success('Order placed successfully!', { title: 'Order Confirmed' });
        setTimeout(() => navigate('/my-orders'), 1500);
      }
    } catch (error) {
      setPaymentError(error.error || 'Payment failed. Please try again.');
      toast.error(error.error || 'Payment failed. Please try again.', {
        title: 'Payment Error',
        duration: 5000,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentError(null);
    handlePlaceOrder();
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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-office flex items-center justify-center font-semibold transition-all duration-smooth ${
                      step >= s
                        ? 'bg-primary text-white'
                        : 'bg-secondary-light text-secondary-dark'
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
                  className="border-2 border-dashed border-gray-300 rounded-card p-12 text-center hover:border-primary transition-colors duration-smooth cursor-pointer bg-secondary-light"
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
                        {formatFileSize(selectedFile.size)}
                      </p>
                      {fileMetadata && fileMetadata.hasThumbnail && fileMetadata.thumbnail && (
                        <img
                          src={fileMetadata.thumbnail}
                          alt="Preview"
                          className="mt-4 mx-auto max-h-32 rounded"
                        />
                      )}
                      {fileMetadata && needsReupload(fileMetadata) && (
                        <p className="text-xs text-yellow-600 mt-2">
                          ⚠️ Large file - will require re-upload when needed
                        </p>
                      )}
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
                    <div className="w-full bg-secondary-light rounded-full h-2">
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
                          className={`border-2 rounded-card p-4 cursor-pointer transition-all duration-smooth hover:border-primary ${
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Select a Dealer</h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowMapView(!showMapView)}
                  >
                    <Map size={18} className="mr-2" />
                    {showMapView ? 'List View' : 'Map View'}
                  </Button>
                </div>
                
                {showMapView ? (
                  <div className="h-96 mb-4">
                    <MapView
                      dealers={sortedDealers}
                      userLocation={userLocation}
                      onDealerClick={setSelectedDealer}
                      selectedDealerId={selectedDealer}
                    />
                  </div>
                ) : null}
                
                <div className="space-y-4">
                  {sortedDealers.map((dealer) => (
                    <div
                      key={dealer.id}
                      onClick={() => setSelectedDealer(dealer.id)}
                      className={`border-2 rounded-card p-6 cursor-pointer transition-all duration-smooth hover:shadow-card ${
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
                          <div className="bg-primary text-white rounded-office p-1">
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
                            className="px-2 py-1 bg-secondary-light text-secondary-dark text-xs rounded-office"
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
              <>
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

                <Card className="mt-6">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`border-2 rounded-lg p-4 text-left transition-all duration-smooth hover:border-primary ${
                        paymentMethod === 'stripe'
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200'
                      }`}
                    >
                      <CreditCard size={24} className="mb-2 text-primary" />
                      <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                      <p className="text-xs text-gray-600 mt-1">Stripe</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`border-2 rounded-lg p-4 text-left transition-all duration-smooth hover:border-primary ${
                        paymentMethod === 'paypal'
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200'
                      }`}
                    >
                      <Wallet size={24} className="mb-2 text-primary" />
                      <p className="font-semibold text-gray-900">PayPal</p>
                      <p className="text-xs text-gray-600 mt-1">Pay with PayPal</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`border-2 rounded-lg p-4 text-left transition-all duration-smooth hover:border-primary ${
                        paymentMethod === 'upi'
                          ? 'border-primary bg-primary-light'
                          : 'border-gray-200'
                      }`}
                    >
                      <Building2 size={24} className="mb-2 text-primary" />
                      <p className="font-semibold text-gray-900">UPI / Net Banking</p>
                      <p className="text-xs text-gray-600 mt-1">Instant Payment</p>
                    </button>
                  </div>

                  {/* Stripe Payment Form */}
                  {paymentMethod === 'stripe' && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Mock Mode:</strong> Use any 16-digit card number, valid MM/YY date, and 3-digit CVV
                        </p>
                      </div>
                      <Input
                        label="Card Number"
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        value={paymentData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          setPaymentData({ ...paymentData, cardNumber: formatted });
                        }}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry Date"
                          id="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          maxLength="5"
                          value={paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setPaymentData({ ...paymentData, expiryDate: value });
                          }}
                          required
                        />
                        <Input
                          label="CVV"
                          id="cvv"
                          type="text"
                          placeholder="123"
                          maxLength="3"
                          value={paymentData.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                            setPaymentData({ ...paymentData, cvv: value });
                          }}
                          required
                        />
                      </div>
                      <Input
                        label="Cardholder Name"
                        id="cardholderName"
                        type="text"
                        placeholder="John Doe"
                        value={paymentData.cardholderName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {/* PayPal Payment Form */}
                  {paymentMethod === 'paypal' && (
                    <div className="border-t pt-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Mock Mode:</strong> Click "Pay with PayPal" to simulate PayPal payment
                        </p>
                      </div>
                      <div className="flex items-center justify-center p-8 bg-secondary-light rounded-card">
                        <div className="text-center">
                          <Wallet size={48} className="mx-auto text-primary mb-4" />
                          <p className="text-gray-600 mb-4">Pay securely with PayPal</p>
                          <p className="text-sm text-gray-500">No additional information required</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI / Net Banking Payment Form */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>Mock Mode:</strong> Enter any UPI ID (e.g., user@paytm) or select "Net Banking"
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="upiType"
                                value="upi"
                                checked={paymentData.upiId !== 'netbanking'}
                                onChange={() => setPaymentData({ ...paymentData, upiId: '', bankCode: '' })}
                                className="mr-2"
                              />
                              UPI
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="upiType"
                                value="netbanking"
                                checked={paymentData.upiId === 'netbanking'}
                                onChange={() => setPaymentData({ ...paymentData, upiId: 'netbanking', bankCode: '' })}
                                className="mr-2"
                              />
                              Net Banking
                            </label>
                          </div>
                        </div>
                        {paymentData.upiId !== 'netbanking' ? (
                          <Input
                            label="UPI ID"
                            id="upiId"
                            type="text"
                            placeholder="yourname@paytm"
                            value={paymentData.upiId}
                            onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                            required
                          />
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Bank
                            </label>
                            <select
                              value={paymentData.bankCode}
                              onChange={(e) => setPaymentData({ ...paymentData, bankCode: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="">Select a bank</option>
                              <option value="hdfc">HDFC Bank</option>
                              <option value="icici">ICICI Bank</option>
                              <option value="sbi">State Bank of India</option>
                              <option value="axis">Axis Bank</option>
                              <option value="kotak">Kotak Mahindra Bank</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Error Display */}
                  {paymentError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <X size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-800 mb-1">Payment Failed</p>
                          <p className="text-sm text-red-700">{paymentError}</p>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleRetryPayment}
                            className="mt-3"
                          >
                            Retry Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </>
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
                <Button 
                  variant="primary" 
                  onClick={handlePlaceOrder}
                  isLoading={isProcessingPayment}
                  disabled={isProcessingPayment || !paymentMethod}
                >
                  {isProcessingPayment ? 'Processing Payment...' : 'Pay & Place Order'}
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

