const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGOOSE_URI}`,
        );

        console.log(`Connected to database: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to database: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDatabase;