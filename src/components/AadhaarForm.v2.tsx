import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

interface AadhaarFormV2Props {
  onSubmit: (aadhaar: string, name?: string, village?: string, contact?: string) => void;
  loading: boolean;
}

function AadhaarFormV2({ onSubmit, loading }: AadhaarFormV2Props) {
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarConfirm, setAadhaarConfirm] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [contact, setContact] = useState('');
  const [existingFarmer, setExistingFarmer] = useState<any>(null);
  const [isNewFarmer, setIsNewFarmer] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-focus management
  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const aadhaarConfirmInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on first input when component mounts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (aadhaarInputRef.current && !loading) {
        aadhaarInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Auto-focus to confirmation field when first Aadhaar field is complete
  useEffect(() => {
    if (aadhaar.length === 12 && aadhaarConfirmInputRef.current) {
      aadhaarConfirmInputRef.current.focus();
    }
  }, [aadhaar]);

  // Auto-focus to name field for new farmers when Aadhaar fields match
  useEffect(() => {
    if (isNewFarmer && aadhaar.length === 12 && aadhaar === aadhaarConfirm && nameInputRef.current) {
      // Small delay to let the new farmer UI render
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isNewFarmer, aadhaar, aadhaarConfirm]);

  // Check if user exists when both Aadhaar fields are complete and match
  useEffect(() => {
    const checkUserExists = async () => {
      if (aadhaar.length === 12 && aadhaar === aadhaarConfirm && aadhaar) {
        setCheckingUser(true);
        setError(null);
        setExistingFarmer(null);
        setIsNewFarmer(false);
        setName('');
        setVillage('');
        setContact('');
        
        try {
          const { farmer } = await api.getFarmer(aadhaar);
          if (farmer) {
            setExistingFarmer(farmer);
            setIsNewFarmer(false);
          } else {
            setExistingFarmer(null);
            setIsNewFarmer(true);
          }
        } catch (err) {
          // If farmer not found, they're a new user
          setExistingFarmer(null);
          setIsNewFarmer(true);
        } finally {
          setCheckingUser(false);
        }
      } else {
        setExistingFarmer(null);
        setIsNewFarmer(false);
        setName('');
        setVillage('');
        setContact('');
      }
    };

    checkUserExists();
  }, [aadhaar, aadhaarConfirm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
      setError('Aadhaar must be 12 digits.');
      return;
    }

    if (aadhaar !== aadhaarConfirm) {
      setError('Aadhaar numbers do not match.');
      return;
    }

    if (isNewFarmer && !name.trim()) {
      setError('Name is required for new farmer registration.');
      return;
    }

    if (isNewFarmer && !village.trim()) {
      setError('Village is required for new farmer registration.');
      return;
    }

    onSubmit(aadhaar, isNewFarmer ? name : undefined, isNewFarmer ? village : undefined, isNewFarmer ? contact : undefined);
  };

  return (
    <div className="card card-elevated p-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Aadhaar Verification</h2>
            <p className="text-sm text-gray-500">Enter farmer's 12-digit Aadhaar number to begin</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Aadhaar Input */}
          <div className="space-y-2">
            <label htmlFor="aadhaar" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Aadhaar Number
            </label>
            <input
              ref={aadhaarInputRef}
              type="text"
              id="aadhaar"
              value={aadhaar.replace(/(\d{4})(?=\d)/g, '$1 ')}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
              maxLength={14} // Account for spaces
              className="input-field w-full font-mono text-base tracking-wider"
              placeholder="XXXX XXXX XXXX"
              disabled={loading}
              autoComplete="off"
            />
            <div className="text-xs text-gray-500">
              {aadhaar.length}/12 digits entered
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label htmlFor="aadhaarConfirm" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Aadhaar Number
            </label>
            <input
              ref={aadhaarConfirmInputRef}
              type="text"
              id="aadhaarConfirm"
              value={aadhaarConfirm.replace(/(\d{4})(?=\d)/g, '$1 ')}
              onChange={(e) => setAadhaarConfirm(e.target.value.replace(/\D/g, ''))}
              maxLength={14}
              className={`input-field w-full font-mono text-base tracking-wider ${
                aadhaarConfirm.length > 0 && aadhaar !== aadhaarConfirm 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : aadhaarConfirm.length > 0 && aadhaar === aadhaarConfirm 
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : ''
              }`}
              placeholder="Re-enter Aadhaar"
              disabled={loading}
              autoComplete="off"
            />
            <div className="flex items-center gap-2 text-xs">
              {aadhaarConfirm.length > 0 && (
                aadhaar === aadhaarConfirm ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Numbers match
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Numbers don't match
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* User Status Section */}
        {aadhaar.length === 12 && aadhaar === aadhaarConfirm && (
          <div className="space-y-4">
            {/* Checking User Status */}
            {checkingUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-700">Checking farmer registration...</span>
                </div>
              </div>
            )}

            {/* Existing Farmer Found */}
            {!checkingUser && existingFarmer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-green-800 mb-1">Existing Farmer Found</h3>
                    <p className="text-lg font-semibold text-green-900">{existingFarmer.name}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Farmer ID: {existingFarmer.id} • Registered in system
                    </p>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* New Farmer Registration */}
            {!checkingUser && isNewFarmer && !existingFarmer && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">New Farmer Registration</h3>
                    <p className="text-xs text-amber-700 mb-4">
                      This Aadhaar number is not registered. Please enter farmer details to register.
                    </p>
                    
                    {/* Farmer Details for New Registration */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Farmer's Full Name *
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input-field w-full"
                          placeholder="Enter full name as per Aadhaar"
                          disabled={loading}
                          autoComplete="name"
                          required
                        />
                        <div className="text-xs text-gray-500">
                          Name should match exactly as printed on Aadhaar card
                        </div>
                      </div>

                      {/* Village Input */}
                      <div className="space-y-2">
                        <label htmlFor="village" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Village Name *
                        </label>
                        <input
                          type="text"
                          id="village"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          className="input-field w-full"
                          placeholder="Enter village name"
                          disabled={loading}
                          autoComplete="address-level2"
                          required
                        />
                        <div className="text-xs text-gray-500">
                          Enter the village where the farmer resides
                        </div>
                      </div>

                      {/* Contact Number Input (Optional) */}
                      <div className="space-y-2 lg:col-span-2">
                        <label htmlFor="contact" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Contact Number (Optional)
                        </label>
                        <input
                          type="tel"
                          id="contact"
                          value={contact}
                          onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="input-field w-full font-mono"
                          placeholder="Enter 10-digit mobile number"
                          disabled={loading}
                          autoComplete="tel"
                          maxLength={10}
                        />
                        <div className="text-xs text-gray-500">
                          {contact.length > 0 ? `${contact.length}/10 digits entered` : 'Optional field for communication'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button 
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || checkingUser || aadhaar.length !== 12 || aadhaar !== aadhaarConfirm || (isNewFarmer && (!name.trim() || !village.trim()))}
            className={`btn-primary w-full py-3 px-6 text-base font-semibold ${
              loading || checkingUser || aadhaar.length !== 12 || aadhaar !== aadhaarConfirm || (isNewFarmer && (!name.trim() || !village.trim()))
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg transform hover:-translate-y-0.5 transition-all'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : checkingUser ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Checking Registration...
              </div>
            ) : existingFarmer ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Continue with {existingFarmer.name}
              </div>
            ) : isNewFarmer ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Register New Farmer
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify Aadhaar
              </div>
            )}
          </button>
        </div>

        {/* Quick Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Aadhaar verification is secure and complies with UIDAI guidelines
          </p>
        </div>
      </form>
    </div>
  );
}

export default AadhaarFormV2;