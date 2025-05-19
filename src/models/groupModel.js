/**
 * @file Defines the Group model.
 * @module GroupModel
 * @author Johan Persson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    unique: [true, 'That group name is already in use.'],
    minlength: [1, 'Group name must be at least 1 character long'],
    maxlength: [100, 'Group name cannot be longer than 100 charaters long']
  },
  description: {
    type: String,
    required: [true, 'A description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be longer than 500 characters long']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, {
  timestamps: true,
  versionKey: false
})

schema.add(BASE_SCHEMA)

export const GroupModel = mongoose.model('Group', schema)
