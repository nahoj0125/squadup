/**
 * @file Defines the Message model.
 * @module MessageModel
 * @author Johan Persson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'A message is required'],
    trim: true,
    maxlength: [2000, 'A message cannot be longer than 2000 characters.']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

schema.add(BASE_SCHEMA)

export const MessageModel = mongoose.model('Message', schema)
