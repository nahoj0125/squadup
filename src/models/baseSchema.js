/**
 * @file Defines the base schema.
 * @module baseSchema
 * @author Johan Persson
 */

import mongoose from 'mongoose'

const convertOptions = Object.freeze({
  getters: true,
  versionKey: false,
  /**
   * Transforms the document, removing the _id property.
   *
   * @param {object} doc - The mongoose document which is being converted.
   * @param {object} ret - The plain object representation which has been converted.
   * @returns {object} The transformed object.
   */
  transform: (doc, ret) => {
    delete ret._id
    return ret
  }
})

const baseSchema = new mongoose.Schema({}, {
  timestamps: true,
  toObject: convertOptions,
  toJSON: convertOptions,
  optimisticConcurrency: false
})

export const BASE_SCHEMA = Object.freeze(baseSchema)
