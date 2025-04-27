/**
 * @file Defines the Availability model.
 * @module AvailabilityModel
 * @author Johan Persson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  timeSlots: [{
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true,
  versionKey: false
})

schema.index({ user: 1, group: 1 })

schema.add(BASE_SCHEMA)

export const AvailabilityModel = mongoose.model('Availability', schema)
