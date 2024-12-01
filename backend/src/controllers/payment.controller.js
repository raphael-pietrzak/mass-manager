require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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