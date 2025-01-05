import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const CheckoutForm = ({ totalAmount, shippingInfo, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    // Teslimat bilgilerinin kontrolü
    if (!shippingInfo.fullName.trim()) {
      toast.error('Lütfen ad soyad bilgisini giriniz');
      return;
    }
    if (!shippingInfo.address.trim()) {
      toast.error('Lütfen adres bilgisini giriniz');
      return;
    }
    if (!shippingInfo.city.trim()) {
      toast.error('Lütfen şehir bilgisini giriniz');
      return;
    }
    if (!shippingInfo.postalCode.trim()) {
      toast.error('Lütfen posta kodu bilgisini giriniz');
      return;
    }

    setLoading(true);
    try {
      // Create payment intent
      const { data: { clientSecret } } = await axiosInstance.post('/api/orders/create-payment-intent', {
        amount: totalAmount,
        shipping: shippingInfo,
        items: cartItems
      });

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.fullName,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              postal_code: shippingInfo.postalCode,
              country: shippingInfo.country,
            },
          },
        },
      });

      if (error) {
        // Özel hata mesajları
        switch (error.code) {
          case 'card_declined':
            if (error.decline_code === 'insufficient_funds') {
              toast.error('Kartta yeterli bakiye bulunmuyor. Lütfen başka bir kart deneyiniz.');
            } else {
              toast.error('Kart reddedildi. Lütfen başka bir kart deneyiniz.');
            }
            break;
          case 'expired_card':
            toast.error('Kartınızın son kullanma tarihi geçmiş.');
            break;
          case 'incorrect_cvc':
            toast.error('Güvenlik kodu hatalı.');
            break;
          case 'processing_error':
            toast.error('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
            break;
          default:
            toast.error(error.message || 'Ödeme işlemi başarısız oldu.');
        }
      } else if (paymentIntent.status === 'succeeded') {
        try {
          // Create order
          const orderItems = cartItems.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.isDiscount ? item.product.discountPrice : item.product.price,
            qty: item.quantity
          }));

          await axiosInstance.post('/api/orders', {
            orderItems,
            shippingAddress: shippingInfo,
            paymentMethod: 'Kredi Kartı',
            paymentResult: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
            },
            totalPrice: totalAmount,
            shippingPrice: 0,
            taxPrice: 0,
          });

          clearCart();
          toast.success('Siparişiniz başarıyla oluşturuldu!');
          navigate('/orders');
        } catch (error) {
          toast.error('Sipariş oluşturulurken bir hata oluştu. Lütfen müşteri hizmetleriyle iletişime geçin.');
          console.error('Sipariş oluşturma hatası:', error);
        }
      }
    } catch (error) {
      toast.error('Ödeme işlemi sırasında bir hata oluştu.');
      console.error('Ödeme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
      </button>
    </form>
  );
};

const Checkout = () => {
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'TR',
  });
  const { cartItems, getTotal } = useCart();
  const navigate = useNavigate();
  const [stripePromise, setStripePromise] = useState(null);
  const total = getTotal();

  useEffect(() => {
    if (!cartItems.length) {
      navigate('/cart');
      return;
    }
    // Initialize Stripe
    setStripePromise(loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY));
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h1 className="text-2xl font-bold mb-6">Ödeme Bilgileri</h1>

          {/* Shipping Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Teslimat Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ad Soyad<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Ad Soyad giriniz"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adres<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Teslimat adresi giriniz"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Şehir<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Şehir giriniz"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Posta Kodu<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="Posta kodu giriniz"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} adet x ₺{item.product.isDiscount ? item.product.discountPrice : item.product.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">
                    ₺{((item.product.isDiscount ? item.product.discountPrice : item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg">
                <span>Toplam</span>
                <span>₺{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h2>
            {stripePromise && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  totalAmount={total}
                  shippingInfo={shippingInfo}
                  cartItems={cartItems}
                />
              </Elements>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
