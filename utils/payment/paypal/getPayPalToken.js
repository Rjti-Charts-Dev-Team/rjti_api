require('dotenv').config({
    path: './config/.env'
})

const node_env = process.env.ENVIRONMENT;

const clientId = node_env === 'prod' ? process.env.PAYPAL_CLIENT_ID_PROD : process.env.PAYPAL_CLIENT_ID_DEV;
const clientSecret = node_env === 'prod' ? process.env.PAYPAL_CLIENT_SECRET_PROD : process.env.PAYPAL_CLIENT_SECRET_DEV;

const getPayPalToken = async () => {

    const credentials = btoa(`${clientId}:${clientSecret}`);

    try {
        const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials'
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        return data.access_token;
    } catch (error) {
        console.error('Failed to fetch PayPal token:', error);
    }
};

module.exports = getPayPalToken