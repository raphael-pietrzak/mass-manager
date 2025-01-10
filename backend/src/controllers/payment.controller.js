require('dotenv').config();
const Stripe = require('stripe');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_fallbackKey';
const stripe = new Stripe(stripeSecretKey);

module.exports = {
  createPaymentIntent: async (req, res) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000,
        currency: 'usd',
      });
      res.json(paymentIntent);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating payment intent');
    }
  },
};