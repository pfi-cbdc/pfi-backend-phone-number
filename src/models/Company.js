const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  gstin: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  pan: {
    type: String,
    required: true
  },
  alternateContact: {
    type: String
  },
  website: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
companySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
