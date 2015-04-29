var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MedModelSchema = new Schema({
    idref: String,
    name: String,
    desc: String,
    src: Object,
    timestamp: Date,
    author: String,
    logo: String,
    downloads: Number
});

mongoose.model('MedModel', MedModelSchema);

var UserSchema = new Schema({
    username: { type: String, unique: true },
    fullname: String,
    password: String,
    authkey: String
});

mongoose.model('User', UserSchema);

var AuthkeySchema = new Schema({
    email: String,
    authkey: String,
});

mongoose.model('Authkey', AuthkeySchema);

var RequestSchema = new Schema({
    email: String,
    title: String,
    message: String,
});

mongoose.model('Message', RequestSchema);
