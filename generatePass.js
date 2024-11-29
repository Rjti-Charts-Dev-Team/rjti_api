const bcrypt = require('bcryptjs');

const generate = async (password) => {

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log(hash);
}

console.log(generate('admin123'));

module.exports = generate;