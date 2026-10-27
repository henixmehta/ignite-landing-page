import React, { useState, useEffect, useMemo } from 'react';

// Dynamic API Base URL resolver: defaults to localhost:3005 in local dev, and api.ragnutrition.in in production
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3005';
  }
  return 'https://api.ragnutrition.in';
};

// Configuration object for pricing, countdown target, and checkout WhatsApp link
const CONFIG = {
  offerEnds: '2026-10-31T23:59:59+05:30',
  mrp: 4300,
  price: 2580,
  maxQty: 10,
  orderLink: 'https://wa.me/919875270200',
  get apiBaseUrl() {
    return getApiBaseUrl();
  }
};

// Lazy load Razorpay Checkout SDK
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Customer transformation data
const STORIES = [
  {
    name: 'Jenil',
    lost: '−15 kg',
    w1: '96 kg',
    w2: '81 kg',
    time: '2 months',
    coach: 'Deep Zakarde',
    before: '/images/jenil-before.jpg',
    after: '/images/jenil-after.jpg'
  },
  {
    name: '9-month transformation',
    lost: '−33.8 kg',
    w1: '96 kg',
    w2: '62.2 kg',
    time: '9 months',
    coach: 'Dt. Chirag Pandey',
    before: '/images/client9m-before.jpg',
    after: '/images/client9m-after.jpg'
  },
  {
    name: 'Hetvi',
    lost: '−10.9 kg',
    w1: '91.1 kg',
    w2: '80.2 kg',
    time: '4.5 months',
    coach: 'Foram Desai',
    before: '/images/hetvi-before.jpg',
    after: '/images/hetvi-after.jpg'
  },
  {
    name: '5-month transformation',
    lost: '−11 kg',
    w1: '79 kg',
    w2: '68 kg',
    time: '5 months',
    coach: 'Chirag Pandey',
    before: '/images/client5m-before.jpg',
    after: '/images/client5m-after.jpg'
  }
];

const INGREDIENTS = [
  { name: 'L-Carnitine L-Tartrate', dose: '3.8 g' },
  { name: 'Psyllium Husk', dose: '1.0 g' },
  { name: 'Inulin (prebiotic)', dose: '900 mg' },
  { name: 'Taurine', dose: '600 mg' },
  { name: 'Mulberry Leaf Extract', dose: '500 mg' },
  { name: 'Apple Cider Vinegar Powder', dose: '450 mg' },
  { name: 'Garcinia Cambogia Extract', dose: '400 mg' },
  { name: 'Barberry Root Extract', dose: '400 mg' },
  { name: 'Cinnamon Extract', dose: '380 mg' },
  { name: 'Green Tea Extract', dose: '300 mg' },
  { name: 'Grape Seed Extract', dose: '300 mg' },
  { name: 'Caffeine', dose: '50 mg' },
  { name: 'Vitamin C', dose: '80 mg' },
  { name: 'Niacinamide (Vitamin B3)', dose: '16 mg' },
  { name: 'Pyridoxine (Vitamin B6)', dose: '1.9 mg' },
  { name: 'Chromium (picolinate)', dose: '50 mcg' }
];

const FAQS = [
  {
    q: 'How does IGNITE help with fat loss?',
    a: 'Fat loss happens when the body uses more energy than it takes in. IGNITE supports that process from three sides: L-Carnitine helps transport fatty acids into the mitochondria to be used as fuel, caffeine and green tea support energy and thermogenesis, and psyllium fibre supports fullness so a calorie-controlled diet is easier to follow.'
  },
  {
    q: 'When will I notice a difference?',
    a: 'Most people notice the energy and fullness effects within the first few days. Visible changes depend on your diet, training and consistency. Track your waist measurement and weight weekly for 6–8 weeks for the most honest picture.'
  },
  {
    q: 'How much caffeine does it have?',
    a: '50 mg per serving as per the label — roughly half a cup of regular brewed coffee. If you are sensitive to caffeine, avoid IGNITE, and avoid taking it late in the evening.'
  },
  {
    q: 'How do I take it?',
    a: 'Mix 1 scoop (6 g) in 180–200 ml of water, shake for about 10 seconds and drink before a meal or after your workout. Do not exceed the daily dose printed on the label.'
  },
  {
    q: 'Does it contain sugar?',
    a: 'No added sugar. It is sweetened with sucralose and has about 31 kcal per 12 g serving.'
  },
  {
    q: 'Are there delivery charges?',
    a: 'Delivery charges, if applicable for your pincode, are shown clearly before you pay.'
  }
];

export default function IgniteLandingPage() {
  // Quantity state
  const [qty, setQty] = useState(1);

  // Before / After interactive slider state
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  // FAQ accordion state
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(CONFIG.offerEnds));

  function calculateTimeLeft(targetIso) {
    const totalMs = Math.max(0, new Date(targetIso).getTime() - Date.now());
    return {
      total: totalMs,
      d: String(Math.floor(totalMs / 86400000)).padStart(2, '0'),
      h: String(Math.floor((totalMs / 3600000) % 24)).padStart(2, '0'),
      m: String(Math.floor((totalMs / 60000) % 60)).padStart(2, '0'),
      s: String(Math.floor((totalMs / 1000) % 60)).padStart(2, '0')
    };
  }

  // Ticking timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(CONFIG.offerEnds));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Preload transformation images
  useEffect(() => {
    STORIES.forEach((story) => {
      const img1 = new Image();
      img1.src = story.before;
      const img2 = new Image();
      img2.src = story.after;
    });
  }, []);

  const currentStory = STORIES[activeStoryIdx];

  // Price calculations
  const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
  const totalMrp = fmt(CONFIG.mrp * qty);
  const totalSavings = fmt((CONFIG.mrp - CONFIG.price) * qty);
  const totalPayable = fmt(CONFIG.price * qty);

  // WhatsApp order link with dynamic cart summary
  const orderUrl = useMemo(() => {
    const msg = `Hi, I want to order IGNITE Fat Burner (Tangy Orange) x ${qty} at the 40% OFF price of ${totalPayable}.`;
    return `${CONFIG.orderLink}?text=${encodeURIComponent(msg)}`;
  }, [qty, totalPayable]);

  // Direct Order / Inquiry Form State
  const [orderForm, setOrderForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    paymentMethod: 'Prepaid (UPI / Card)',
    notes: ''
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Lock body scroll and listen for Escape key when popup modal is open
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !orderSubmitting) {
          setIsCheckoutOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCheckoutOpen, orderSubmitting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
    if (orderError) setOrderError('');
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError('');

    // Validation
    const trimmedName = orderForm.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setOrderError('Please enter your full name.');
      return;
    }

    const cleanMobile = orderForm.mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      setOrderError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const trimmedEmail = orderForm.email.trim();
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setOrderError('Please enter a valid email address.');
      return;
    }

    const trimmedAddress = orderForm.address.trim();
    if (!trimmedAddress || trimmedAddress.length < 5) {
      setOrderError('Please enter your full delivery address.');
      return;
    }

    const trimmedCity = orderForm.city.trim();
    if (!trimmedCity) {
      setOrderError('Please enter your city.');
      return;
    }

    const cleanPincode = orderForm.pincode.replace(/\D/g, '');
    if (!cleanPincode || cleanPincode.length !== 6) {
      setOrderError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setOrderSubmitting(true);
    const orderRef = `IGN-${Date.now().toString().slice(-6)}`;
    const numericPayable = CONFIG.price * qty;

    const manifestText = [
      `=== IGNITE DIRECT ORDER [${orderRef}] ===`,
      `Product: IGNITE Fat Burner (Tangy Orange · 250 g jar)`,
      `Quantity: ${qty} jar(s)`,
      `Price per jar: ₹${CONFIG.price.toLocaleString('en-IN')} (40% OFF Launch Offer)`,
      `Total MRP: ${totalMrp}`,
      `Total Discount: - ${totalSavings}`,
      `Total Payable: ${totalPayable}`,
      `Payment Method: ${orderForm.paymentMethod}`,
      ``,
      `--- CUSTOMER & SHIPPING DETAILS ---`,
      `Full Name: ${trimmedName}`,
      `Mobile: ${cleanMobile}`,
      `Email: ${trimmedEmail}`,
      `Delivery Address: ${trimmedAddress}`,
      `City: ${trimmedCity}`,
      `State: ${orderForm.state}`,
      `PIN Code: ${cleanPincode}`,
      `Instructions: ${orderForm.notes.trim() || 'None'}`,
      `Ordered At: ${new Date().toLocaleString('en-IN')}`,
      `==========================================`
    ].join('\n');

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      mobile: cleanMobile,
      subject: `IGNITE Order [${orderRef}]: ${qty}x Tangy Orange (${totalPayable}) - ${trimmedName}`,
      message: manifestText,
      source: 'RAG Nutrition - IGNITE Fat Burner Landing Page',
      details: {
        order_id: orderRef,
        order_type: 'Direct Product Order',
        product_name: 'IGNITE Fat Burner',
        flavour: 'Tangy Orange',
        weight: '250g',
        quantity: qty,
        unit_price: CONFIG.price,
        total_mrp: CONFIG.mrp * qty,
        discount: (CONFIG.mrp - CONFIG.price) * qty,
        total_amount: numericPayable,
        payment_method: orderForm.paymentMethod,
        full_name: trimmedName,
        mobile: cleanMobile,
        whatsapp: cleanMobile,
        email: trimmedEmail,
        address: trimmedAddress,
        city: trimmedCity,
        state: orderForm.state,
        pincode: cleanPincode,
        delivery_notes: orderForm.notes.trim(),
        order_timestamp: new Date().toISOString()
      }
    };

    // Process payment directly through Razorpay
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Unable to initialize Razorpay SDK. Please check your internet connection.');
      }

      // Create order via backend API (Razorpay Key is retrieved dynamically from backend)
      let createRes = await fetch(`${CONFIG.apiBaseUrl}/public/v1/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericPayable,
          receipt: orderRef,
          notes: {
            product: 'IGNITE Fat Burner',
            quantity: String(qty),
            customer_name: trimmedName,
            customer_mobile: cleanMobile,
            source: 'RAG Nutrition - IGNITE Fat Burner Landing Page'
          }
        })
      });

      // Localhost resilience: If remote endpoint 404s and running in local browser, retry against local backend
      if (!createRes.ok && createRes.status === 404 && CONFIG.apiBaseUrl !== 'http://localhost:3005' && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        createRes = await fetch('http://localhost:3005/public/v1/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: numericPayable,
            receipt: orderRef,
            notes: {
              product: 'IGNITE Fat Burner',
              quantity: String(qty),
              customer_name: trimmedName,
              customer_mobile: cleanMobile,
              source: 'RAG Nutrition - IGNITE Fat Burner Landing Page'
            }
          })
        });
      }

      const data = await createRes.json();
      if (!createRes.ok || !data?.data?.key || !data?.data?.order_id) {
        if (createRes.status === 404) {
          throw new Error(`The payment API route (/public/v1/razorpay/create-order) is not yet active on ${CONFIG.apiBaseUrl}. Please ensure 'git pull origin main && pm2 restart all' is run on the production server, or tap below to order directly via WhatsApp.`);
        }
        throw new Error(data?.message || 'Backend server did not return a valid Razorpay order ID or key.');
      }

      const rzpOrderData = data.data;

      const options = {
        key: rzpOrderData.key, // Key supplied directly from backend API
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || 'INR',
        name: 'GOMZI NUTRITION',
        description: `IGNITE Fat Burner (Tangy Orange) · ${qty} Jar(s)`,
        image: '/images/whitelogo.webp',
        order_id: rzpOrderData?.order_id || undefined,
        prefill: {
          name: trimmedName,
          email: trimmedEmail,
          contact: cleanMobile
        },
        notes: {
          product: 'IGNITE Fat Burner',
          quantity: String(qty),
          order_ref: orderRef,
          shipping_city: trimmedCity,
          shipping_pincode: cleanPincode,
          source: 'RAG Nutrition - IGNITE Fat Burner Landing Page'
        },
        theme: {
          color: '#C2410C'
        },
        modal: {
          ondismiss: () => {
            setOrderSubmitting(false);
            setOrderError('Payment popup closed. You can tap below to retry payment.');
          }
        },
        handler: async (response) => {
          const paymentId = response.razorpay_payment_id;
          const paidOrderId = response.razorpay_order_id || rzpOrderData?.order_id || orderRef;

          const paidManifest = [
            `=== IGNITE PREPAID ORDER [${orderRef}] ===`,
            `Payment Status: PAID (Verified via Razorpay)`,
            `Razorpay Payment ID: ${paymentId}`,
            `Razorpay Order ID: ${paidOrderId}`,
            `Product: IGNITE Fat Burner (Tangy Orange · 250 g jar)`,
            `Quantity: ${qty} jar(s)`,
            `Price per jar: ₹${CONFIG.price.toLocaleString('en-IN')} (40% OFF Launch Offer)`,
            `Total MRP: ${totalMrp}`,
            `Total Discount: - ${totalSavings}`,
            `Total Paid: ${totalPayable}`,
            `Payment Method: Prepaid (UPI / Card / NetBanking)`,
            ``,
            `--- CUSTOMER & SHIPPING DETAILS ---`,
            `Full Name: ${trimmedName}`,
            `Mobile: ${cleanMobile}`,
            `Email: ${trimmedEmail}`,
            `Delivery Address: ${trimmedAddress}`,
            `City: ${trimmedCity}`,
            `State: ${orderForm.state}`,
            `PIN Code: ${cleanPincode}`,
            `Instructions: ${orderForm.notes.trim() || 'None'}`,
            `Paid At: ${new Date().toLocaleString('en-IN')}`,
            `==========================================`
          ].join('\n');

          const paidPayload = {
            name: trimmedName,
            email: trimmedEmail,
            mobile: cleanMobile,
            subject: `[PAID ORDER] IGNITE [${orderRef}]: ${qty}x Tangy Orange (${totalPayable}) - RZP: ${paymentId}`,
            message: paidManifest,
            source: 'RAG Nutrition - IGNITE Fat Burner Landing Page',
            details: {
              order_id: orderRef,
              order_type: 'Prepaid Product Order',
              product_name: 'IGNITE Fat Burner',
              flavour: 'Tangy Orange',
              weight: '250g',
              quantity: qty,
              unit_price: CONFIG.price,
              total_mrp: CONFIG.mrp * qty,
              discount: (CONFIG.mrp - CONFIG.price) * qty,
              total_amount: numericPayable,
              payment_method: 'Prepaid (UPI / Card)',
              payment_status: 'PAID',
              razorpay_payment_id: paymentId,
              razorpay_order_id: paidOrderId,
              razorpay_signature: response.razorpay_signature || '',
              full_name: trimmedName,
              mobile: cleanMobile,
              whatsapp: cleanMobile,
              email: trimmedEmail,
              address: trimmedAddress,
              city: trimmedCity,
              state: orderForm.state,
              pincode: cleanPincode,
              delivery_notes: orderForm.notes.trim(),
              order_timestamp: new Date().toISOString()
            }
          };

          // Post verified paid order to backend so it immediately appears in /rag/product-order
          const landingOrderPayload = {
            name: trimmedName,
            email: trimmedEmail,
            mobile: cleanMobile,
            address: trimmedAddress,
            city: trimmedCity,
            state: orderForm.state,
            pincode: cleanPincode,
            quantity: qty,
            amount: numericPayable,
            payment_mode: 'ONLINE',
            notes: orderForm.notes.trim(),
            razorpay_payment_id: paymentId,
            razorpay_order_id: paidOrderId,
            razorpay_signature: response.razorpay_signature || ''
          };

          let generatedReceiptId = orderRef;
          try {
            let res = await fetch(`${CONFIG.apiBaseUrl}/public/v1/orders/create-landing-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(landingOrderPayload)
            });

            if (!res.ok && res.status === 404) {
              if (CONFIG.apiBaseUrl !== 'http://localhost:3005' && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                res = await fetch('http://localhost:3005/public/v1/orders/create-landing-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(landingOrderPayload)
                });
              } else {
                // Fallback to active contact-inquiry endpoint
                res = await fetch(`${CONFIG.apiBaseUrl}/public/v1/contact-inquiry`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(paidPayload)
                });
              }
            }

            const resJson = await res.json();
            if (resJson?.data?.receipt_id) {
              generatedReceiptId = resJson.data.receipt_id;
            }
          } catch (err) {
            console.warn('Logging order to server had error:', err);
          }

          setOrderSuccess({
            orderId: generatedReceiptId,
            paymentId: paymentId,
            name: trimmedName,
            mobile: cleanMobile,
            email: trimmedEmail,
            total: totalPayable,
            qty,
            paymentMethod: 'Prepaid (UPI / Card)',
            address: `${trimmedAddress}, ${trimmedCity}, ${orderForm.state} - ${cleanPincode}`
          });
          setOrderSubmitting(false);
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', (err) => {
        setOrderSubmitting(false);
        setOrderError(`Payment failed: ${err.error?.description || 'Transaction declined'}. Please try again.`);
      });
      rzpInstance.open();
    } catch (err) {
      setOrderSubmitting(false);
      setOrderError(`Razorpay initialization failed: ${err.message || 'Error loading payment gateway'}.`);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#17140F', background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Offer Strip */}
      <div style={{ background: '#17140F', color: '#FFFFFF', textAlign: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 500, letterSpacing: '0.02em' }}>
        <span style={{ color: '#FDBA74', fontWeight: 700 }}>FIRST-EVER LAUNCH OFFER</span> · 40% OFF · Ends in {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m
      </div>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #EFE7DF', padding: '12px 16px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} aria-label="Gomzi Supplements">
            <img
              src="/images/whitelogo.webp"
              alt="Gomzi Supplements · The Legacy of RAG"
              style={{ height: 'clamp(32px, 8vw, 42px)', width: 'auto', display: 'block' }}
            />
          </a>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            style={{
              background: '#C2410C',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 15,
              padding: '12px 20px',
              borderRadius: 999,
              minHeight: 44,
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            Get 40% OFF
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ background: '#FFF6EF', padding: '36px 20px 48px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span style={{ alignSelf: 'flex-start', background: '#17140F', color: '#FDBA74', fontSize: 13, fontWeight: 700, padding: '8px 14px', borderRadius: 999, letterSpacing: '0.06em' }}>
              INDIA’S SCIENCE-FIRST FAT BURNER DRINK
            </span>
            <h1 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(42px, 7vw, 74px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
              Diets don’t fail.<br />
              <span style={{ color: '#E2570F' }}>Hunger wins.</span>
            </h1>
            <p style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 'clamp(20px, 2.6vw, 26px)', lineHeight: 1.2 }}>
              IGNITE is how you win it back — one tangy orange scoop.
            </p>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: '#4A4238', maxWidth: 520 }}>
              <b style={{ color: '#17140F' }}>3.8 g L-Carnitine</b> to move fat into the cell’s engine. <b style={{ color: '#17140F' }}>Natural fibre</b> to keep cravings quiet. <b style={{ color: '#17140F' }}>Green tea + caffeine</b> for clean energy. Built to make every calorie deficit easier to stick to.
            </p>

            {/* Quick Stats Grid */}
            <div className="hero-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, maxWidth: 520 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #EFE7DF', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 24, color: '#C2410C' }}>0 g</span>
                <span style={{ fontSize: 13, color: '#4A4238' }}>added sugar</span>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #EFE7DF', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 24, color: '#C2410C' }}>16</span>
                <span style={{ fontSize: 13, color: '#4A4238' }}>active ingredients</span>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #EFE7DF', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 24, color: '#C2410C' }}>31</span>
                <span style={{ fontSize: 13, color: '#4A4238' }}>kcal / serving</span>
              </div>
            </div>

            {/* Pricing Callout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 14, marginTop: 4 }}>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 46, lineHeight: 1 }}>₹2,580</span>
              <span style={{ fontSize: 20, color: '#6B6157', textDecoration: 'line-through', textDecorationColor: '#DC2626', textDecorationThickness: 3, paddingBottom: 4 }}>
                MRP ₹4,300
              </span>
              <span style={{ background: '#17140F', color: '#FDBA74', fontWeight: 700, fontSize: 14, padding: '6px 10px', borderRadius: 8, marginBottom: 4 }}>
                First-ever 40% OFF · Save ₹1,720
              </span>
            </div>

            {/* CTAs */}
            <div className="hero-cta-group" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                style={{
                  background: '#C2410C',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 18,
                  padding: '16px 28px',
                  borderRadius: 14,
                  minHeight: 56,
                  boxSizing: 'border-box',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                Claim 40% OFF now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <a
                href="#results"
                style={{
                  color: '#17140F',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '16px 18px',
                  borderRadius: 14,
                  border: '2px solid #17140F',
                  minHeight: 56,
                  boxSizing: 'border-box',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                See real journeys
              </a>
            </div>
            <span style={{ fontSize: 13, color: '#6B6157' }}>Delivery charges, if applicable, are shown before you pay.</span>
          </div>

          {/* Hero Image */}
          <div style={{ flex: '1 1 360px', minWidth: 0, position: 'relative' }}>
            <img
              src="/images/hero.jpg"
              alt="Fit woman smiling, holding out a jar of IGNITE with a glass of orange drink"
              style={{
                width: '100%',
                aspectRatio: '762 / 1000',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: 28,
                display: 'block',
                boxShadow: '0 24px 60px rgba(120, 50, 10, 0.18)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 14,
                top: 14,
                background: '#C2410C',
                color: '#FFFFFF',
                borderRadius: 999,
                width: 96,
                height: 96,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transform: 'rotate(-10deg)',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>FIRST EVER</span>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 30, lineHeight: 1 }}>40%</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>OFF</span>
            </div>
          </div>

        </div>
      </section>

      {/* LAUNCH OFFER COUNTDOWN */}
      <section style={{ background: '#17140F', color: '#FFFFFF', padding: '36px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '24px 36px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ alignSelf: 'flex-start', background: '#FDBA74', color: '#17140F', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', padding: '6px 12px', borderRadius: 999 }}>
              FIRST-EVER LAUNCH OFFER
            </span>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.02, letterSpacing: '-0.02em' }}>
              We’ve never offered this before.<br />
              <span style={{ color: '#FB923C' }}>Don’t miss it.</span>
            </span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#D6CCC2' }}>
              Launch price for our first customers only. Once the offer window closes, IGNITE goes back to full MRP.
            </span>
          </div>

          <div style={{ flex: '1 1 320px', minWidth: 0, background: '#FFFFFF', color: '#17140F', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, color: '#6B6157', textDecoration: 'line-through', textDecorationColor: '#DC2626', textDecorationThickness: 3 }}>
                ₹4,300
              </span>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 44, lineHeight: 1, color: '#C2410C' }}>
                ₹2,580
              </span>
            </div>

            {timeLeft.total > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#9A3412' }}>OFFER ENDS IN</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, textAlign: 'center' }}>
                  <div style={{ background: '#17140F', color: '#FFFFFF', borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{timeLeft.d}</span>
                    <span style={{ fontSize: 11, color: '#D6CCC2' }}>DAYS</span>
                  </div>
                  <div style={{ background: '#17140F', color: '#FFFFFF', borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{timeLeft.h}</span>
                    <span style={{ fontSize: 11, color: '#D6CCC2' }}>HRS</span>
                  </div>
                  <div style={{ background: '#17140F', color: '#FFFFFF', borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{timeLeft.m}</span>
                    <span style={{ fontSize: 11, color: '#D6CCC2' }}>MINS</span>
                  </div>
                  <div style={{ background: '#C2410C', color: '#FFFFFF', borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 26, lineHeight: 1 }}>{timeLeft.s}</span>
                    <span style={{ fontSize: 11, color: '#FFEDD5' }}>SECS</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              style={{
                background: '#C2410C',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: 17,
                padding: '15px 20px',
                borderRadius: 14,
                minHeight: 54,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Lock in my launch price
            </button>
          </div>

        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section style={{ borderBottom: '1px solid #EFE7DF', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#6B6157', textAlign: 'center' }}>
            CERTIFIED · LICENSED · MADE FOR INDIA &amp; THE WORLD
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '14px 22px' }}>
            
            {/* GMP Badge */}
            <svg width="76" height="76" viewBox="0 0 100 100" role="img" aria-label="GMP certified">
              <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#15803D" strokeWidth="4" />
              <circle cx="50" cy="50" r="39" fill="#15803D" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2.5" />
              <text x="50" y="33" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">GOOD MFG</text>
              <text x="50" y="59" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="26" fontWeight="900" fill="#FFFFFF">GMP</text>
              <text x="50" y="74" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">PRACTICE</text>
            </svg>

            {/* ISO Badge */}
            <svg width="76" height="76" viewBox="0 0 100 100" role="img" aria-label="ISO certified">
              <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="4" />
              <circle cx="50" cy="50" r="39" fill="#1E40AF" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2.5" />
              <text x="50" y="33" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">CERTIFIED</text>
              <text x="50" y="59" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="26" fontWeight="900" fill="#FFFFFF">ISO</text>
              <text x="50" y="74" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">COMPANY</text>
            </svg>

            {/* HACCP Badge */}
            <svg width="76" height="76" viewBox="0 0 100 100" role="img" aria-label="HACCP certified">
              <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#0369A1" strokeWidth="4" />
              <circle cx="50" cy="50" r="39" fill="#0369A1" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2.5" />
              <text x="50" y="33" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">FOOD SAFETY</text>
              <text x="50" y="56" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="17" fontWeight="900" fill="#FFFFFF">HACCP</text>
              <text x="50" y="74" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">CERTIFIED</text>
            </svg>

            {/* Kosher Badge */}
            <svg width="76" height="76" viewBox="0 0 100 100" role="img" aria-label="Kosher certified">
              <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#4D7C0F" strokeWidth="4" />
              <circle cx="50" cy="50" r="39" fill="#4D7C0F" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2.5" />
              <text x="50" y="33" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">CERTIFIED</text>
              <text x="50" y="56" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="16" fontWeight="900" fill="#FFFFFF">KOSHER</text>
              <text x="50" y="74" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">PRODUCT</text>
            </svg>

            {/* Halal Badge */}
            <svg width="76" height="76" viewBox="0 0 100 100" role="img" aria-label="Halal certified">
              <circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#166534" strokeWidth="4" />
              <circle cx="50" cy="50" r="39" fill="#166534" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 2.5" />
              <text x="50" y="33" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">CERTIFIED</text>
              <text x="50" y="56" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="18" fontWeight="900" fill="#FFFFFF">HALAL</text>
              <text x="50" y="74" textAnchor="middle" fontFamily="Archivo, Arial, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF" letterSpacing="1">PRODUCT</text>
            </svg>

            {/* FSSAI Badge */}
            <span style={{ height: 76, padding: '0 16px', borderRadius: 16, border: '2px solid #E5D9CE', background: '#FFFFFF', display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box' }}>
              <img src="/images/fssai.png" alt="FSSAI licensed" style={{ height: 38, width: 'auto', display: 'block' }} />
            </span>

            {/* FDA Badge */}
            <span style={{ height: 76, padding: '0 16px', borderRadius: 16, background: '#0B5CAD', color: '#FFFFFF', display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 18, lineHeight: 1.1, boxSizing: 'border-box', letterSpacing: '0.02em' }}>
              US FDA<br />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>REGISTERED FACILITY</span>
            </span>

          </div>
        </div>
      </section>

      {/* THE SCIENCE & EQUATION */}
      <section id="science" style={{ padding: '64px 20px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#C2410C' }}>THE SCIENCE</span>
            <h2 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Why most diets fail — and what the body actually needs
            </h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#4A4238' }}>
              Body fat is stored energy. It gets used when the body spends more energy than it takes in. Diets usually break down for three reasons: stored fat isn’t being used efficiently, energy drops, and hunger wins. IGNITE is formulated around exactly these three points.
            </p>
          </div>

          <div style={{ background: '#17140F', color: '#FFFFFF', borderRadius: 24, padding: '28px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '14px 22px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 24 }}>Energy out</span>
              <span style={{ fontSize: 13, color: '#D6CCC2' }}>activity + metabolism</span>
            </div>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 34, color: '#FB923C' }}>&gt;</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 24 }}>Energy in</span>
              <span style={{ fontSize: 13, color: '#D6CCC2' }}>what you eat</span>
            </div>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 34, color: '#FB923C' }}>=</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 24, color: '#FDBA74' }}>Stored fat is used</span>
              <span style={{ fontSize: 13, color: '#D6CCC2' }}>IGNITE supports every side of this</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 4 MECHANISMS */}
      <section style={{ padding: '24px 20px 64px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          
          {/* Step 1 */}
          <div style={{ border: '1px solid #EFE7DF', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: '#FFEDD5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#C2410C' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z" />
                </svg>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', letterSpacing: '0.08em' }}>STEP 1 · FAT TRANSPORT</span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>Moves fat to where it gets burned</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#4A4238' }}>
              Fat can only be burned inside the mitochondria — the cell’s engine. <b style={{ color: '#17140F' }}>L-Carnitine</b> is the body’s natural carrier that shuttles fatty acids into the mitochondria to be used as fuel.
            </p>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#17140F', background: '#FFF6EF', padding: '8px 12px', borderRadius: 10 }}>
              3.8 g L-Carnitine L-Tartrate
            </span>
          </div>

          {/* Step 2 */}
          <div style={{ border: '1px solid #EFE7DF', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: '#FFEDD5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#C2410C' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', letterSpacing: '0.08em' }}>STEP 2 · ENERGY</span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>Energy &amp; thermogenesis — no crash</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#4A4238' }}>
              <b style={{ color: '#17140F' }}>Caffeine</b> and <b style={{ color: '#17140F' }}>green tea catechins</b> support alertness and the body’s heat production (thermogenesis). <b style={{ color: '#17140F' }}>Taurine</b> and <b style={{ color: '#17140F' }}>Vitamins B3 &amp; B6</b> support normal energy metabolism — so workouts stay strong while eating less.
            </p>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#17140F', background: '#FFF6EF', padding: '8px 12px', borderRadius: 10 }}>
              50 mg caffeine · 300 mg green tea · 600 mg taurine
            </span>
          </div>

          {/* Step 3 */}
          <div style={{ border: '1px solid #EFE7DF', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: '#FFEDD5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#C2410C' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v5M11 3v5M17 3c-2 2-2 6 0 8v10" />
                </svg>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', letterSpacing: '0.08em' }}>STEP 3 · FULLNESS</span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>Fibre that keeps you feeling full</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#4A4238' }}>
              <b style={{ color: '#17140F' }}>Psyllium husk</b> absorbs water and forms a soft gel in the stomach, slowing digestion and supporting a feeling of fullness. <b style={{ color: '#17140F' }}>Inulin</b>, a prebiotic fibre, feeds the good bacteria in the gut.
            </p>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#17140F', background: '#FFF6EF', padding: '8px 12px', borderRadius: 10 }}>
              1 g psyllium · 900 mg inulin · 3 g total fibre
            </span>
          </div>

          {/* Step 4 */}
          <div style={{ border: '1px solid #EFE7DF', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: '#FFEDD5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#C2410C' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12h4l3-8 4 16 3-8h4" />
                </svg>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412', letterSpacing: '0.08em' }}>STEP 4 · METABOLISM</span>
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.15 }}>Steadier energy from carbs</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#4A4238' }}>
              <b style={{ color: '#17140F' }}>Chromium</b> contributes to normal macronutrient metabolism. <b style={{ color: '#17140F' }}>Mulberry leaf</b>, <b style={{ color: '#17140F' }}>cinnamon</b> and <b style={{ color: '#17140F' }}>apple cider vinegar</b> are traditionally used to support a steadier response to carb-rich meals.
            </p>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#17140F', background: '#FFF6EF', padding: '8px 12px', borderRadius: 10 }}>
              50 mcg chromium · 500 mg mulberry · 450 mg ACV
            </span>
          </div>

        </div>
      </section>

      {/* LIFESTYLE SPLIT */}
      <section style={{ background: '#17140F', color: '#FFFFFF', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <img
              src="/images/gym-woman.jpg"
              alt="Woman at the gym holding a jar of IGNITE"
              loading="lazy"
              decoding="async"
              style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 24, display: 'block' }}
            />
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#FDBA74' }}>BUILT FOR REAL ROUTINES</span>
            <h2 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              One glass. Five jobs.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { title: 'Fat metabolism', desc: 'L-Carnitine for fat transport' },
                { title: 'Energy & thermogenesis', desc: 'caffeine + green tea' },
                { title: 'Appetite & satiety', desc: 'psyllium fibre' },
                { title: 'Metabolic support', desc: 'chromium, B3, B6, Vitamin C' },
                { title: 'Prebiotic gut support', desc: 'inulin' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ flex: '0 0 auto', width: 28, height: 28, borderRadius: 999, background: '#E2570F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  <span style={{ fontSize: 17, lineHeight: 1.5 }}>
                    <b>{item.title}</b> — {item.desc}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#D6CCC2' }}>
              Tastes like a tangy orange drink, not a medicine. Just 31 kcal and 0 g added sugar per serving.
            </p>
          </div>
        </div>
      </section>

      {/* RESULTS / BEFORE-AFTER SLIDER */}
      <section id="results" style={{ padding: '64px 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#C2410C' }}>REAL PEOPLE · REAL DISCIPLINE</span>
            <h2 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Slide to see what consistency looks like
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#4A4238' }}>
              Journeys from Gomzi’s coaching community — people who committed to a structured diet and training plan with their coach.
            </p>
          </div>

          {/* Transformation Tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {STORIES.map((story, idx) => {
              const isActive = activeStoryIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveStoryIdx(idx);
                    setSliderPos(50);
                  }}
                  style={{
                    flex: '0 0 auto',
                    minHeight: 44,
                    padding: '10px 16px',
                    borderRadius: 999,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    background: isActive ? '#17140F' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#17140F',
                    border: isActive ? '2px solid #17140F' : '2px solid #E5D9CE',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {story.name} · {story.lost}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
            
            {/* Before / After Image Box with interactive clip-path */}
            <div style={{ flex: '1 1 320px', minWidth: 0, maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', borderRadius: 24, overflow: 'hidden', background: '#EFE7DF' }}>
                <img
                  src={currentStory.before}
                  alt={`${currentStory.name} Before`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <img
                  src={currentStory.after}
                  alt={`${currentStory.name} After`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    clipPath: `inset(0 0 0 ${sliderPos}%)`
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${sliderPos}%`,
                    width: 4,
                    marginLeft: -2,
                    background: '#FFFFFF',
                    boxShadow: '0 0 12px rgba(0,0,0,0.35)',
                    pointerEvents: 'none'
                  }}
                />
                <span style={{ position: 'absolute', left: 12, top: 12, background: 'rgba(23,20,15,0.85)', color: '#FFFFFF', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 10px', borderRadius: 8 }}>
                  BEFORE · {currentStory.w1}
                </span>
                <span style={{ position: 'absolute', right: 12, top: 12, background: '#C2410C', color: '#FFFFFF', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', padding: '6px 10px', borderRadius: 8 }}>
                  AFTER · {currentStory.w2}
                </span>
              </div>

              <label htmlFor="ba-slider-react" style={{ fontSize: 14, fontWeight: 700, color: '#4A4238' }}>
                Drag to compare before and after
              </label>
              <input
                id="ba-slider-react"
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                style={{ width: '100%', height: 44, accentColor: '#C2410C', cursor: 'pointer' }}
              />
            </div>

            {/* Story Details Card */}
            <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(56px, 9vw, 96px)', lineHeight: 0.9, color: '#C2410C', letterSpacing: '-0.03em' }}>
                {currentStory.lost}
              </span>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 24 }}>
                {currentStory.name}
              </span>

              <div className="payment-method-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <div style={{ background: '#FFF6EF', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13, color: '#6B6157' }}>Journey</span>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{currentStory.time}</span>
                </div>
                <div style={{ background: '#FFF6EF', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13, color: '#6B6157' }}>Weight</span>
                  <span style={{ fontWeight: 700, fontSize: 17 }}>{currentStory.w1} → {currentStory.w2}</span>
                </div>
              </div>

              <span style={{ fontSize: 15, color: '#4A4238' }}>
                Coach: <b style={{ color: '#17140F' }}>{currentStory.coach}</b>
              </span>

              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#6B6157', borderTop: '1px solid #EFE7DF', paddingTop: 14 }}>
                Results shown are from Gomzi’s coaching programme, which combines a personalised diet and training plan. They are not the result of any supplement alone. Individual results vary with diet, activity and consistency.
              </p>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                style={{
                  alignSelf: 'flex-start',
                  background: '#17140F',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 16,
                  padding: '14px 22px',
                  borderRadius: 14,
                  minHeight: 52,
                  boxSizing: 'border-box',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                Start your journey — 40% OFF
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section style={{ padding: '64px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap-reverse', gap: 36, alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#C2410C' }}>HOW TO USE</span>
            <h2 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Mix. Shake. Go.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div style={{ background: '#FFF6EF', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 28, color: '#C2410C' }}>01</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Add 1 scoop (6 g)</span>
                <span style={{ fontSize: 14, color: '#4A4238' }}>to 180–200 ml water</span>
              </div>
              <div style={{ background: '#FFF6EF', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 28, color: '#C2410C' }}>02</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Shake 10 seconds</span>
                <span style={{ fontSize: 14, color: '#4A4238' }}>until fully dissolved</span>
              </div>
              <div style={{ background: '#FFF6EF', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 28, color: '#C2410C' }}>03</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Drink before a meal</span>
                <span style={{ fontSize: 14, color: '#4A4238' }}>or after your workout</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#4A4238' }}>
              Pro tip: take it 20–30 minutes before your biggest meal, so the fibre has time to work on fullness. Do not exceed the daily dose on the label.
            </p>
          </div>

          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <img
              src="/images/gym-man.jpg"
              alt="Man adding a scoop of IGNITE to a shaker at the gym"
              loading="lazy"
              decoding="async"
              style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 24, display: 'block' }}
            />
          </div>

        </div>
      </section>

      {/* FULL TRANSPARENCY / INGREDIENTS */}
      <section style={{ background: '#FFF6EF', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#C2410C' }}>100% LABEL TRANSPARENCY</span>
            <h2 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              No proprietary blends. Every dose on the label.
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#4A4238' }}>
              Per serving of 12 g (2 scoops), as printed on the jar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 24px', background: '#FFFFFF', borderRadius: 20, padding: '12px 24px', border: '1px solid #EFE7DF' }}>
            {INGREDIENTS.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid #F3ECE5', fontSize: 15 }}>
                <span style={{ color: '#4A4238' }}>{item.name}</span>
                <span style={{ fontWeight: 700 }}>{item.dose}</span>
              </div>
            ))}
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #EFE7DF', background: '#FFFFFF' }}>
            <img
              src="/images/label.jpg"
              alt="Full IGNITE product label with nutrition facts, ingredients and warnings"
              loading="lazy"
              decoding="async"
              style={{ display: 'block', width: '100%', minWidth: 900 }}
            />
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR / WHO IT'S NOT FOR */}
      <section style={{ padding: '64px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          
          <div style={{ borderRadius: 20, padding: 28, background: '#17140F', color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 24 }}>IGNITE is for adults who</h3>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#E7DFD7' }}>· Are following a calorie-controlled diet</span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#E7DFD7' }}>· Train or stay active most days</span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#E7DFD7' }}>· Struggle with cravings between meals</span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#E7DFD7' }}>· Want energy without a sugary drink</span>
          </div>

          <div style={{ borderRadius: 20, padding: 28, background: '#FFFFFF', border: '2px solid #EFE7DF', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 24 }}>Please don’t use IGNITE if you</h3>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#4A4238' }}>· Are under 18, pregnant or breastfeeding</span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#4A4238' }}>· Are sensitive to caffeine</span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#4A4238' }}>· Have a liver condition or are on a low-protein diet</span>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: '#4A4238' }}>· Take regular medication — ask your doctor first</span>
          </div>

        </div>
      </section>

      {/* ORDER SECTION / CART & CALCULATOR */}
      <section id="order" className="section-pad-standard" style={{ background: '#FFF6EF', padding: '64px 20px' }}>
        <div className="order-card-container" style={{ maxWidth: 560, margin: '0 auto', background: '#FFFFFF', borderRadius: 28, padding: '28px 24px', boxShadow: '0 24px 60px rgba(120, 50, 10, 0.14)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <img
            src="/images/product-drink.jpg"
            alt="IGNITE jar with a glass of tangy orange drink"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 18, display: 'block' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 26, lineHeight: 1.1 }}>
              IGNITE Fat Burner<br />
              <span style={{ fontSize: 15, fontWeight: 500, color: '#6B6157', fontFamily: "'DM Sans', sans-serif" }}>
                Tangy Orange · 250 g jar
              </span>
            </span>
            <span style={{ background: '#C2410C', color: '#FFFFFF', fontWeight: 800, fontSize: 15, padding: '8px 12px', borderRadius: 10 }}>
              40% OFF
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 48, lineHeight: 1 }}>₹2,580</span>
            <span style={{ fontSize: 20, color: '#6B6157', textDecoration: 'line-through', textDecorationColor: '#DC2626', textDecorationThickness: 3, paddingBottom: 6 }}>
              MRP ₹4,300
            </span>
            <span style={{ fontSize: 15, color: '#9A3412', fontWeight: 700, paddingBottom: 6 }}>per jar</span>
          </div>

          {/* Interactive Quantity Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, border: '1px solid #EFE7DF', borderRadius: 16, padding: '12px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: '1px solid #E5D9CE',
                  background: '#FFFFFF',
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#17140F'
                }}
              >
                −
              </button>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22, minWidth: 24, textAlign: 'center' }}>
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((prev) => Math.min(CONFIG.maxQty, prev + 1))}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: '1px solid #E5D9CE',
                  background: '#FFFFFF',
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#17140F'
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Cart Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4A4238' }}>MRP</span>
              <span style={{ textDecoration: 'line-through', color: '#6B6157' }}>{totalMrp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4A4238' }}>40% discount</span>
              <span style={{ color: '#9A3412', fontWeight: 700 }}>− {totalSavings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4A4238' }}>Delivery</span>
              <span style={{ color: '#4A4238' }}>Calculated at checkout, if applicable</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #E5D9CE', paddingTop: 12, fontSize: 19, fontWeight: 700 }}>
              <span>You pay</span>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900 }}>{totalPayable}</span>
            </div>
          </div>

          {/* Quick Action to open Checkout Popup */}
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            style={{
              background: '#C2410C',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 900,
              fontFamily: 'Archivo, sans-serif',
              fontSize: 18,
              padding: '16px 20px',
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(194, 65, 12, 0.3)',
              transition: 'background 0.2s ease'
            }}
          >
            <span>⚡ Buy Now in Express Popup — {totalPayable}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          {/* Fallback WhatsApp Link */}
          <div style={{ borderTop: '1px dashed #EFE7DF', paddingTop: 14, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#6B6157', display: 'block', marginBottom: 8 }}>
              Prefer speaking with a nutrition coach first?
            </span>
            <a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#059669',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.89-9.884 9.89m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order via WhatsApp Support
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, textAlign: 'center', fontSize: 13, color: '#4A4238', fontWeight: 500 }}>
            <span>🔒 Secure order</span>
            <span>🚚 Ships across India &amp; abroad</span>
            <span>📞 Support: +91 98752 70200</span>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={{ padding: '64px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ margin: 0, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 'clamp(30px, 4.6vw, 42px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Questions, answered
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} style={{ border: '1px solid #EFE7DF', borderRadius: 16, overflow: 'hidden', background: '#FFFFFF' }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '18px 20px',
                      minHeight: 56,
                      boxSizing: 'border-box',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#17140F'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: 22, color: '#C2410C', userSelect: 'none' }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 15, lineHeight: 1.6, color: '#4A4238' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#17140F', color: '#D6CCC2', padding: '40px 20px 110px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13, lineHeight: 1.6 }}>
          <img
            src="/images/whitelogo-darkmode.webp"
            alt="Gomzi Supplements"
            style={{ height: 38, width: 'auto', alignSelf: 'flex-start', display: 'block' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div>
              <b style={{ color: '#FFFFFF' }}>Manufactured by</b><br />
              Gomzi Life Science LLP, 443-445, First Floor, RJD Textile Park, Pal-Hazira Road, Ichhapore, Surat-394510. FSSAI No. 10724997000182
            </div>
            <div>
              <b style={{ color: '#FFFFFF' }}>Marketed by</b><br />
              RAG Strength &amp; Nutrition, G-23, Time Square, Gaurav Path Road, Adajan, Pal Gam, Surat-394510. FSSAI No. 20726031000381<br />
              Customer care: +91 98752 70200 · info@ragnutrition.in
            </div>
          </div>
          <p style={{ margin: 0, color: '#B8ADA2' }}>
            Disclaimer: IGNITE is a nutraceutical for adults and is not intended to diagnose, treat, cure or prevent any disease. Not for medicinal use. Contains caffeine and sucralose. Works best alongside a calorie-controlled diet and regular physical activity; individual results vary. Made in a facility that handles milk, soy, wheat and peanuts. Images are for illustration purposes.
          </p>
          <span style={{ color: '#8F857B' }}>© 2026 Gomzi Supplements · The Legacy of RAG</span>
        </div>
      </footer>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="mobile-sticky-bar">
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 22 }}>
              ₹2,580{' '}
              <span style={{ fontSize: 14, fontWeight: 500, color: '#6B6157', textDecoration: 'line-through', fontFamily: "'DM Sans', sans-serif" }}>
                ₹4,300
              </span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9A3412' }}>
              Launch offer ends in {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            style={{
              background: '#C2410C',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 16,
              padding: '14px 22px',
              borderRadius: 14,
              minHeight: 48,
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(194, 65, 12, 0.4)'
            }}
          >
            <span>Buy now</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CHECKOUT POPUP MODAL (Triggered on "Buy Now" / "Claim 40% OFF")
          ========================================================================= */}
      {isCheckoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          className="checkout-backdrop"
          onClick={(e) => {
            // Close if clicking outside modal box
            if (e.target === e.currentTarget && !orderSubmitting) {
              setIsCheckoutOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(23, 20, 15, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            className="checkout-card"
            style={{
              width: '100%',
              maxWidth: 580,
              maxHeight: '92vh',
              background: '#FFFFFF',
              borderRadius: 24,
              boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              margin: 'auto'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #EFE7DF',
                background: '#FAFAF9',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src="/images/whitelogo.webp"
                  alt="Gomzi Supplements"
                  style={{ height: 32, width: 'auto', display: 'block' }}
                />
                <span
                  id="checkout-modal-title"
                  style={{
                    fontFamily: 'Archivo, sans-serif',
                    fontWeight: 900,
                    fontSize: 14,
                    color: '#C2410C',
                    background: '#FFF6EF',
                    padding: '4px 10px',
                    borderRadius: 8,
                    letterSpacing: '0.04em'
                  }}
                >
                  EXPRESS CHECKOUT
                </span>
              </div>
              <button
                type="button"
                onClick={() => !orderSubmitting && setIsCheckoutOpen(false)}
                aria-label="Close modal"
                disabled={orderSubmitting}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid #E5D9CE',
                  background: '#FFFFFF',
                  color: '#4A4238',
                  fontSize: 18,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: orderSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="checkout-scroll-body" style={{ padding: '20px 22px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Product Mini Header with Live Qty Stepper */}
              <div
                style={{
                  background: '#FFF6EF',
                  border: '1px solid #FED7AA',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src="/images/product-drink.jpg"
                    alt="IGNITE Fat Burner"
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 16, color: '#17140F', display: 'block' }}>
                      IGNITE Fat Burner
                    </span>
                    <span style={{ fontSize: 13, color: '#6B6157' }}>
                      Tangy Orange · 250 g jar
                    </span>
                  </div>
                </div>

                {/* Stepper + Dynamic Total */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E5D9CE', borderRadius: 10, padding: 4 }}>
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#F5F5F4', cursor: 'pointer', fontWeight: 800, fontSize: 16, color: '#17140F' }}
                    >
                      −
                    </button>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, minWidth: 20, textAlign: 'center' }}>
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty((prev) => Math.min(CONFIG.maxQty, prev + 1))}
                      style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#F5F5F4', cursor: 'pointer', fontWeight: 800, fontSize: 16, color: '#17140F' }}
                    >
                      +
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 20, color: '#C2410C', display: 'block', lineHeight: 1.1 }}>
                      {totalPayable}
                    </span>
                    <span style={{ fontSize: 11, color: '#6B6157', textDecoration: 'line-through' }}>
                      {totalMrp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success View inside Modal */}
              {orderSuccess ? (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '2px solid #86EFAC',
                    borderRadius: 20,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: '#22C55E',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      fontSize: 28,
                      fontWeight: 900
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 24, color: '#14532D', display: 'block' }}>
                      Order Placed Successfully!
                    </span>
                    <span style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>
                      Order ID: <b style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{orderSuccess.orderId}</b>
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #BBF7D0',
                      borderRadius: 14,
                      padding: 16,
                      textAlign: 'left',
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: '#1F2937'
                    }}
                  >
                    <div><b>Product:</b> IGNITE Fat Burner (Tangy Orange) × {orderSuccess.qty}</div>
                    <div><b>Total:</b> <span style={{ color: '#C2410C', fontWeight: 800 }}>{orderSuccess.total}</span></div>
                    <div>
                      <b>Payment:</b>{' '}
                      {orderSuccess.paymentId ? (
                        <span style={{ color: '#15803D', fontWeight: 700 }}>
                          ✓ Paid via Razorpay (ID: <code style={{ fontFamily: 'monospace', background: '#F0FDF4', padding: '2px 6px', borderRadius: 6 }}>{orderSuccess.paymentId}</code>)
                        </span>
                      ) : (
                        <span>💵 Cash on Delivery (Pay at doorstep)</span>
                      )}
                    </div>
                    <div><b>Deliver To:</b> {orderSuccess.name} ({orderSuccess.mobile})</div>
                    <div><b>Address:</b> {orderSuccess.address}</div>
                  </div>

                  <p style={{ margin: 0, fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
                    Your order inquiry has been logged in our system. Our dispatch team at RAG Nutrition will confirm your delivery shortly via SMS &amp; WhatsApp.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <a
                      href={`https://wa.me/919875270200?text=${encodeURIComponent(`Hi, I just placed order ${orderSuccess.orderId} for IGNITE Fat Burner x ${orderSuccess.qty} on the website. Please confirm dispatch.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#16A34A',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 16,
                        padding: '14px 20px',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.89-9.884 9.89m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Track / Confirm via WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSuccess(null);
                        setIsCheckoutOpen(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid #D1D5DB',
                        color: '#4B5563',
                        fontSize: 14,
                        fontWeight: 600,
                        padding: '10px 16px',
                        borderRadius: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                /* The Checkout Form (matching user's screenshot) */
                <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Title & "You pay" strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid #EFE7DF', paddingBottom: 10 }}>
                    <div>
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 19, display: 'block', color: '#17140F' }}>
                        Delivery &amp; Customer Information
                      </span>
                      <span style={{ fontSize: 13, color: '#6B6157' }}>
                        Orders are dispatched directly to your doorstep with tracking.
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 12, color: '#6B6157', display: 'block' }}>You pay</span>
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 22, color: '#17140F' }}>
                        {totalPayable}
                      </span>
                    </div>
                  </div>

                  {orderError && (
                    <div
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: 12,
                        padding: '12px 14px',
                        fontSize: 13,
                        color: '#991B1B',
                        lineHeight: 1.4
                      }}
                    >
                      ⚠️ {orderError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                      Full Name <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={orderForm.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1px solid #D6CCC2',
                        fontSize: 15,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FAFAF9'
                      }}
                    />
                  </div>

                  {/* Mobile & Email in 2 columns */}
                  <div className="form-grid-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                        Mobile Number (WhatsApp) <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={orderForm.mobile}
                        onChange={handleInputChange}
                        placeholder="10-digit number"
                        maxLength={10}
                        required
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1px solid #D6CCC2',
                          fontSize: 15,
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: '#FAFAF9'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                        Email Address <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={orderForm.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        required
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1px solid #D6CCC2',
                          fontSize: 15,
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: '#FAFAF9'
                        }}
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                      Street / Flat / House Address <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <textarea
                      name="address"
                      value={orderForm.address}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Flat No, Society / Building Name, Road, Landmark"
                      required
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1px solid #D6CCC2',
                        fontSize: 15,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FAFAF9',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* City, State, PIN */}
                  <div className="form-grid-three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                        City <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={orderForm.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Surat"
                        required
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1px solid #D6CCC2',
                          fontSize: 15,
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: '#FAFAF9'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                        State <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <select
                        name="state"
                        value={orderForm.state}
                        onChange={handleInputChange}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1px solid #D6CCC2',
                          fontSize: 15,
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: '#FAFAF9'
                        }}
                      >
                        <option value="Gujarat">Gujarat</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Other">Other State / UT</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                        PIN Code <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={orderForm.pincode}
                        onChange={handleInputChange}
                        placeholder="6 digits"
                        maxLength={6}
                        required
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1px solid #D6CCC2',
                          fontSize: 15,
                          fontFamily: 'inherit',
                          outline: 'none',
                          background: '#FAFAF9'
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Method Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#17140F' }}>
                      Payment Method
                    </label>
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: '#FFF6EF',
                      border: '1.5px solid #FDBA74',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>⚡</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#9A3412' }}>
                            Razorpay Instant Checkout
                          </div>
                          <div style={{ fontSize: 12, color: '#7C2D12' }}>
                            UPI (GPay, PhonePe, Paytm), Cards &amp; NetBanking
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#C2410C', color: '#FFFFFF', padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        100% Secure
                      </span>
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#6B6157' }}>
                      Delivery Instructions / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={orderForm.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. Call before delivery, deliver in afternoon"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1px solid #E5D9CE',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        background: '#FAFAF9'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={orderSubmitting}
                    style={{
                      background: orderSubmitting ? '#9A3412' : '#C2410C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 900,
                      fontFamily: 'Archivo, sans-serif',
                      fontSize: 19,
                      padding: '18px 24px',
                      borderRadius: 16,
                      cursor: orderSubmitting ? 'not-allowed' : 'pointer',
                      minHeight: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 8px 24px rgba(194, 65, 12, 0.35)',
                      letterSpacing: '0.01em',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {orderSubmitting ? (
                      <span>Opening Razorpay Gateway...</span>
                    ) : (
                      <>
                        <span>⚡ Pay via Razorpay — {totalPayable}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: 12, color: '#6B6157', marginTop: -4 }}>
                    Instant confirmation · Order inquiry is sent directly to Gomzi Supplements Admin
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, textAlign: 'center', fontSize: 12, color: '#6B6157', fontWeight: 500, borderTop: '1px dashed #E5D9CE', paddingTop: 12 }}>
                    <span>🔒 256-bit Secure</span>
                    <span>🚚 Free Shipping</span>
                    <span>📞 +91 98752 70200</span>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
