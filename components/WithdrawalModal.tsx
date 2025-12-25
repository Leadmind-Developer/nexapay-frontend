export default function WithdrawalModal({ goal, onClose }) {
  const [otp, setOtp] = useState("");

  const requestOtp = async () => {
    await api.post("/savings/break/request", { goalId: goal.id });
  };

  const confirm = async () => {
    await api.post("/savings/break/confirm", { goalId: goal.id, otp });
    onClose();
  };

  useEffect(() => {
    requestOtp();
  }, []);

  return (
    <div className="modal">
      <h2>Confirm Withdrawal</h2>
      <p>OTP sent to your email</p>
      <input
        value={otp}
        onChange={e => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={confirm}>Confirm</button>
    </div>
  );
}
