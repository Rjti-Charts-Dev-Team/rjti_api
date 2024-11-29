const fetch = require('node-fetch');
const paypal = require('paypal-rest-sdk');
const getPayPalToken = require('./getPayPalToken');

const createOrder = async (paymentRecordDetails) => {

    const accessToken = await getPayPalToken();

    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': paymentRecordDetails.id,  // Unique ID for idempotency
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": paymentRecordDetails.forPackage,
                    "amount": {
                        "currency_code": paymentRecordDetails.currency,
                        "value": (paymentRecordDetails.amount).toFixed(2)
                    }
                }
            ],
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                        "brand_name": "RJTI Charts",
                        "locale": "en-US",
                        "landing_page": "LOGIN",
                        "shipping_preference": "NO_SHIPPING",  // No shipping required
                        "user_action": "PAY_NOW",
                        "return_url": `${process.env.CLIENT_URL}/${process.env.SUCCESS_URL}/${paymentRecordDetails.id}`,
                        "cancel_url": `${process.env.CLIENT_URL}/${process.env.CANCEL_URL}`
                    }
                }
            }
        })
    })

    const data = await response.json();

    return data;

}
module.exports = createOrder;