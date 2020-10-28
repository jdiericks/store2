require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event, context) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try{
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch(err){
    return {statusCode: 400};
  }

  //handle strip events
  switch(stripeEvent.type){
    case "payment_intent.succeeded":
      const paymentIntent = stripeEvent.data.object;
      console.log('object', paymentIntent)
      console.log(
        "Payment was successful! Charge info:",
        paymentIntent.charges.data.filter(charge => charge.status === "succeeded")
      );
      break;
    case "charge.dispute.created":
      const charge = stripeEvent.data.object;
      console.log("Someone disputed a pyment!");
      break;
    default:
      //unexpected event type
      return {statusCode: 400};
  }

  //return 200 resp to acknowledge receipt of event
  return {statusCode: 200};
}