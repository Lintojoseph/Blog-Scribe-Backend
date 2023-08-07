const mongoose = require('mongoose');


mongoose.set("strictQuery", false);

const dbase = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        console.log(`MongoDb Connected Successfully : ${connection.connection.host} `);

    } catch (error) {
        console.log("Error", error);
    }
}

module.exports = dbase