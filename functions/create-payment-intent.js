//endpoint to calc order total and create paymentintent on stripe
require("dotenv").config();
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY),
  headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Header": "Content-Type"
  };

exports.handler = async (event, context) => {
  //CORS
  if (event.httpMethod === "OPTIONS"){
    return {
      statusCode: 200,
      headers
    };
  }

  const data = JSON.parse(event.body);
  console.log(data);

  if(!data.items){
    console.log("List of items to purchase is missing.");

    return{
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: "missing information"
      })
    };
  }

  //stripe payment processing begins here
  try{
    //calc order amount on serer and not frontend, using file could replace with db lookup
    const storeDatabase = await axios.get(
      "https://ecommerce-netlify.netlify.app/storedata.json"
    );

    const amount = data.items.reduce((prev, item) => {
      //lookup item and calc item total
      const itemData = storeDatabase.data.find(
        storeItem => storeItem.id === item.id
      );
      return prev + itemData.price * 100 * item.quantity;
    }, 0);

    //create paymentintent on stripe
    const paymentItent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: amount,
      description: "Order from store"
    });

    //send the client_secret to client
    return{
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret
      })
    };

  } catch(err){
    console.log(err);

    return{
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: err
      })
    };
  }
};