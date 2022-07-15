import mongoose from 'mongoose';

const connectDatabase = () => {
    mongoose.connect(process.env.DB_LOCAL_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(
            con => console.log(`Database connected to ${con.connection.host} \nDB_URI : ${process.env.DB_LOCAL_URI}`)
        )
        .catch(err => console.log('ERROR : ' + err));
}

export default connectDatabase;