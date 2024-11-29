const getPayPalToken = require("./getPayPalToken");

const verifyOrder = async (orderId) => {

    const accessToken = await getPayPalToken();

    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const orderDetails = await response.json();

    // Check if the order is completed successfully
    if (orderDetails.status === "COMPLETED") {
        return true;
    } else {
        return false;
    }

}

module.exports = verifyOrder;