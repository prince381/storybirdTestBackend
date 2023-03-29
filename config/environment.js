const dotenv = require('dotenv');

class Environment {
    static setup() {
        dotenv.config();
    }
}

module.exports = Environment;