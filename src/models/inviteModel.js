/**
 * @file Defines the Invitation model.
 * @module InvitationModel
 * @author Johan Persson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

const schema = new mongoose.Schema({
  group: {
    type: mongoose.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  invitedBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true,
  versionKey: false
})

schema.index({ group: 1, invitedUser: 1 }, { unique: true })

schema.add(BASE_SCHEMA)
export const InvitationModel = mongoose.model('Invitation', schema)
