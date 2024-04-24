/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51P8LykP8U8nZQ3AmVNb6Q1MnK0SPwqvxG9eeowCZFlZfioiEzll0lvFIIAhsd1iiSvI9bsRP0mKlPwp54qc3GVCF00HsRcAqur',
);

export const bookTour = async (tourId) => {
  try {
    // 1. Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);
    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
