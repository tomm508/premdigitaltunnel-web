import fs from 'fs';

let code = fs.readFileSync('src/components/TopupModal.tsx', 'utf8');

const target1 = `  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');`;
const replacement1 = `  const [step, setStep] = useState<'select' | 'pay' | 'success' | 'waiting'>('select');
  const [currentTopupId, setCurrentTopupId] = useState<string>('');`;

const target2 = `    try {
      if (user) {
        // Save pending topup in Firestore
        await addDoc(collection(db, 'users', user.uid, 'topups'), {
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
      setTimeout(() => {
        setIsProcessing(false);
        setStep('pay');
      }, 600);
    } catch (e) {`;

const replacement2 = `    try {
      if (user) {
        // Save pending topup in Firestore (Root collection for admin to easily view)
        const ref = await addDoc(collection(db, 'topups'), {
          uid: user.uid,
          userEmail: user.email || 'Unknown',
          amount: currentDepositAmount,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        setCurrentTopupId(ref.id);
      }
      setTimeout(() => {
        setIsProcessing(false);
        setStep('pay');
      }, 600);
    } catch (e) {`;

const target3 = `  const handleSimulatePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      if (user) {
        const newBalance = balance + currentDepositAmount;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Member',
          balance: newBalance,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        onSuccessDeposit(currentDepositAmount);
      }
      setIsProcessing(false);
      setStep('success');
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('success');
    }
  };`;

const replacement3 = `  const handleSimulatePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      if (user && currentTopupId) {
        // Update topup status to waiting_verification instead of instantly adding balance
        await setDoc(doc(db, 'topups', currentTopupId), {
          status: 'waiting_verification',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      setIsProcessing(false);
      setStep('waiting');
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setStep('waiting');
    }
  };`;

const target4 = `          {step === 'success' && (
            <div className="py-6 text-center space-y-4">`;

const replacement4 = `          {step === 'waiting' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Menunggu Verifikasi Admin</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tagihan senilai <strong className="text-emerald-400">Rp {currentDepositAmount.toLocaleString()}</strong> sedang diproses. Admin akan memverifikasi pembayaran Anda maksimal dalam 1x24 jam.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-4">`;

if (code.includes('handleSimulatePaymentSuccess')) {
  code = code.replace(target1, replacement1);
  code = code.replace(target2, replacement2);
  code = code.replace(target3, replacement3);
  code = code.replace(target4, replacement4);
  fs.writeFileSync('src/components/TopupModal.tsx', code);
  console.log("Patched TopupModal.tsx successfully!");
} else {
  console.log("Could not find handleSimulatePaymentSuccess");
}
