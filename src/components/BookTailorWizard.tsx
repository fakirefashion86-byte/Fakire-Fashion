"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type CustomerValues = {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
};

type Category = {
  id: number;
  name: string;
};

export default function BookTailorWizard({
  categories,
  defaultValues,
}: {
  categories: Category[];
  defaultValues: CustomerValues;
}) {
  const router = useRouter();
  
  // Form State
  const [step, setStep] = useState(1);
  const [stitchCategoryId, setStitchCategoryId] = useState<number | null>(null);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("");
  const [customer, setCustomer] = useState(defaultValues);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "Morning (9 AM - 12 PM)",
    "Afternoon (12 PM - 3 PM)",
    "Evening (3 PM - 6 PM)"
  ];

  function updateCustomer<K extends keyof CustomerValues>(key: K, value: CustomerValues[K]) {
    setCustomer((c) => ({ ...c, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    const notes = `Home Visit Preferred Date: ${preferredDate}, Time Slot: ${preferredTimeSlot}`;

    try {
      const res = await fetch("/api/stitch-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stitchCategoryId,
          measurements: {}, // Tailor takes measurements in person
          notes,
          ...customer,
        }),
      });
      
      setLoading(false);
      
      if (!res.ok) {
        setError("Could not submit your booking. Please try again.");
        return;
      }
      
      // Success transition could go here, for now just redirect
      router.push("/stitching/my-orders");
    } catch (e) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  const easeTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  // Category Icon Mapping (simple SVGs for premium look)
  const getCategoryIcon = (name: string) => {
    return (
      <svg className="w-8 h-8 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-gold z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
              step >= i ? "bg-gold text-[#111]" : "bg-[#1f1f1f] border border-white/10 text-white/50"
            }`}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={easeTransition}
              className="absolute inset-0"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-white mb-2">Select Garment Type</h2>
                <p className="text-white/60 text-sm">What would you like our tailors to stitch for you?</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setStitchCategoryId(c.id)}
                    className={`glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] ${
                      stitchCategoryId === c.id ? "glass-card-selected" : ""
                    }`}
                  >
                    {getCategoryIcon(c.name)}
                    <span className={`text-sm font-medium ${stitchCategoryId === c.id ? "text-gold" : "text-white/80"}`}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={!stitchCategoryId}
                  className="liquid-btn px-8 py-3 rounded-full"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={easeTransition}
              className="absolute inset-0"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-white mb-2">Schedule Home Visit</h2>
                <p className="text-white/60 text-sm">When should our master tailor visit you for measurements?</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Preferred Date</label>
                  <input 
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full glass-input p-3 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">Preferred Time</label>
                  <div className="grid gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setPreferredTimeSlot(slot)}
                        className={`glass-card p-4 rounded-lg text-left transition-colors ${
                          preferredTimeSlot === slot ? "glass-card-selected" : ""
                        }`}
                      >
                        <span className={`text-sm ${preferredTimeSlot === slot ? "text-gold font-medium" : "text-white/80"}`}>
                          {slot}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="text-white/60 hover:text-white transition px-4 py-2">
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!preferredDate || !preferredTimeSlot}
                  className="liquid-btn px-8 py-3 rounded-full"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={easeTransition}
              className="absolute inset-0"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-white mb-2">Your Details</h2>
                <p className="text-white/60 text-sm">Where should we send our tailor?</p>
              </div>
              
              <div className="space-y-4">
                <div className="floating-label-group">
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder=" "
                    value={customer.customerName}
                    onChange={(e) => updateCustomer("customerName", e.target.value)}
                    className="floating-label-input"
                  />
                  <label htmlFor="name" className="floating-label">Full Name</label>
                </div>
                
                <div className="floating-label-group">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder=" "
                    value={customer.customerEmail}
                    onChange={(e) => updateCustomer("customerEmail", e.target.value)}
                    className="floating-label-input"
                  />
                  <label htmlFor="email" className="floating-label">Email Address</label>
                </div>
                
                <div className="floating-label-group">
                  <input
                    id="mobile"
                    type="tel"
                    required
                    placeholder=" "
                    value={customer.customerMobile}
                    onChange={(e) => updateCustomer("customerMobile", e.target.value)}
                    className="floating-label-input"
                  />
                  <label htmlFor="mobile" className="floating-label">Mobile Number</label>
                </div>
                
                <div className="floating-label-group">
                  <textarea
                    id="address"
                    required
                    placeholder=" "
                    rows={3}
                    value={customer.customerAddress}
                    onChange={(e) => updateCustomer("customerAddress", e.target.value)}
                    className="floating-label-input resize-none"
                  />
                  <label htmlFor="address" className="floating-label">Visit Address</label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="text-white/60 hover:text-white transition px-4 py-2">
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!customer.customerName || !customer.customerMobile || !customer.customerAddress}
                  className="liquid-btn px-8 py-3 rounded-full"
                >
                  Review Booking
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={easeTransition}
              className="absolute inset-0"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-white mb-2">Confirm Booking</h2>
                <p className="text-white/60 text-sm">Please review your home visit details.</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-white/60 text-sm">Service</span>
                  <span className="text-white font-medium">
                    {categories.find(c => c.id === stitchCategoryId)?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-white/60 text-sm">Date & Time</span>
                  <span className="text-white font-medium text-right">
                    {new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}<br/>
                    <span className="text-xs text-gold">{preferredTimeSlot}</span>
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-white/60 text-sm">Contact</span>
                  <span className="text-white font-medium text-right">
                    {customer.customerName}<br/>
                    <span className="text-xs text-white/60">{customer.customerMobile}</span>
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-white/60 text-sm">Address</span>
                  <span className="text-white text-sm max-w-[60%] text-right leading-tight">
                    {customer.customerAddress}
                  </span>
                </div>
              </div>
              
              {error && <p className="text-sm text-error mt-4">{error}</p>}
              
              <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="text-white/60 hover:text-white transition px-4 py-2" disabled={loading}>
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="liquid-btn px-8 py-3 rounded-full w-full max-w-xs"
                >
                  {loading ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
