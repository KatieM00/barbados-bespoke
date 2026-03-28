import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateCheckin } from '../services/api';

/**
 * Handles the QR code check-in deep link:
 * /checkin?location=BRGT-001&plan=uuid
 */
const CheckinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<{ emoji: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const locationCode = searchParams.get('location') || '';
  const planId = searchParams.get('plan') || undefined;

  useEffect(() => {
    if (!locationCode) {
      setStatus('error');
      setErrorMsg('Invalid QR code — no location code found.');
      return;
    }

    const doCheckin = async () => {
      try {
        const res = await validateCheckin(locationCode, planId);
        setResult({ emoji: res.stamp_emoji, name: res.stamp_name });
        setStatus('success');

        // Auto-redirect to passport after 3s
        setTimeout(() => navigate('/passport', { replace: true }), 3000);
      } catch (err) {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Check-in failed');
      }
    };

    doCheckin();
  }, [locationCode, planId]);// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary-600 to-primary-800 text-white items-center justify-center px-8 text-center gap-6">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-semibold">Validating your stamp...</p>
        </>
      )}

      {status === 'success' && result && (
        <>
          <div className="text-7xl animate-bounce">{result.emoji}</div>
          <div>
            <p className="text-2xl font-bold">Stamp collected!</p>
            <p className="text-primary-100 mt-1">{result.name}</p>
          </div>
          <p className="text-primary-200 text-sm">Redirecting to your passport...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-5xl">❌</div>
          <div>
            <p className="text-xl font-bold">Check-in failed</p>
            <p className="text-primary-200 mt-1 text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-primary-700 font-bold px-6 py-3 rounded-2xl mt-2"
          >
            Back to Home
          </button>
        </>
      )}
    </div>
  );
};

export default CheckinPage;
