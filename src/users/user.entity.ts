import * as bcrypt from 'bcryptjs';
import { Schema } from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import * as mongooseDelete from 'mongoose-delete';
import * as mongoose from 'mongoose';
require('dotenv').config()

var SALT_WORK_FACTOR = 10;
// console.log('MONGODB', process.env.MONGODB)
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const AutoIncrement = require('mongoose-sequence')(mongoose);

const UserSchema = new Schema(
  {
    id: { type: Number, index: true, unique: true },
    username: { type: String, trim: true, required: true, index: true, unique: true },
    email: { type: String, trim: true, required: true, index: true, unique: true },
    password: { type: String, trim: true, required: true },
    fullname: { type: String, required: true },
    title: String,
    image: String,
    description: String,
    superadmin: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    activeToken: String,
    activeExpires: Date,
    refreshToken: String,
    refreshTokenExpires: Date,
  },
  {
    timestamps: true,
  },
)
  .plugin(AutoIncrement, { inc_field: 'id', start_seq: 10 })
  .plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })
  .plugin(mongooseDelete, {
    deletedAt: true,
    deletedBy: true,
    overrideMethods: true,
  });

UserSchema.pre<any>('save', function (next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hashPassword) {
      if (err) return next(err);
      if (user.deviceMAC) {
        bcrypt.hash(user.deviceMAC, salt, function (err, hashDeviceMAC) {
          if (err) return next(err);
          // override the cleartext password with the hashed one
          user.password = hashPassword;
          user.deviceMAC = hashDeviceMAC;
          next();
        })
      } else {
        user.password = hashPassword;
        next();
      }
    });
  });
});

UserSchema.pre<any>('insert', function (next) {
  var user = this;
  if (!user.isModified('password')) return next(null);
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next(null);
    });
  });
});

export { UserSchema }