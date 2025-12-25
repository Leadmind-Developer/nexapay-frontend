export function savingsCreatedEmail(goal) {
  return `
  <h2>Savings Goal Created 🎯</h2>
  <p>Your goal <strong>${goal.title}</strong> has been created.</p>
  <ul>
    <li>Target: ₦${goal.targetAmount}</li>
    <li>Duration: ${goal.durationDays} days</li>
    <li>Interest: ${(goal.interestRate * 100).toFixed(0)}% p.a</li>
  </ul>
  <p>You cannot withdraw until maturity.</p>
  `;
}
