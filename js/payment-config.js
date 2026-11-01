/* Payment page settings. Your own bank account is NOT here and is never shown to advertisers:
   the server (api/pay_start.php) asks Paystack for a one-time account for every payment, and
   Paystack sends the money to the payout account you set up in your Paystack dashboard.

   expiryMinutes   How long a one-time account is shown as valid. Paystack's shortest is 15.
                   (The real expiry is set on the server with SLC_PAY_EXPIRY_MINUTES.)
   pollSeconds     How often the payment page checks whether the money has arrived. */
window.SLC_PAYMENT = {
  expiryMinutes: 15,
  pollSeconds: 5
};
