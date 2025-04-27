/**
 * @file Defines the User model.
 * @module SnippetModel
 * @author Johan Persson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'
import bcrypt from 'bcrypt'

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [6, 'Username must be atleast 6 characters long'],
    maxlength: [200, 'Username can not be longer than 200 characters long']
  },
  firstname: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [1, 'First name must be atleast 1 character long'],
    maxlength: [200, 'Firstname can not be longer than 200 characters long']
  },
  lastname: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [1, 'Last name must be atleast 1 character long'],
    maxlength: [200, 'Last name can not be longer than 200 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [10, 'Password must be atleast 10 characters long'],
    maxlength: 2000
  }
}, {
  timestamps: true,
  versionKey: false
})

schema.add(BASE_SCHEMA)

schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * Authenticates a user by comparing the provided username and password.
 *
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<object>} - Returns the user object if authentication is successful.
 * @throws {Error} - Throws an error if the authentication fails.
 */
schema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid login attempt!')
  } else {
    return user
  }
}

/**
 * Compares a candidate password with the user's hashed password.
 *
 * @param {string} candidatePassword - The password to compare.
 * @returns {Promise<boolean>} - Returns true if passwords match, false otherwise.
 */
schema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Create a model using the schema.
export const UserModel = mongoose.model('User', schema)
