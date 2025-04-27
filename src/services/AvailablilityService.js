/**
 * @file Service for availability operations.
 * @module AvailabilityService
 * @author Johan Persson
 */

import { AvailabilityModel } from '../models/availabliltyModel.js'

/**
 * Service class for managing user availability within groups
 *
 * This class provides methods to set, retrieve, and analyze availability records,
 * including finding common available time slots among group members.
 */
export class AvailabilityService {
  /**
   * Sets or updates a user's availability for a specific group.
   *
   * @param {object} userId - The ID of the user setting availability (string or MongoDB ObjectId)
   * @param {object} groupId - The ID of the group to set availability for (string or MongoDB ObjectId)
   * @param {Array} timeSlots - Array of time slot objects containing start and end times
   * @returns {Promise<object>} A promise that resolves to the updated availability document
   */
  async setAvailability (userId, groupId, timeSlots) {
    let availability = await AvailabilityModel.findOne({ user: userId, group: groupId })

    if (!availability) {
      availability = new AvailabilityModel({
        user: userId,
        group: groupId,
        timeSlots: []
      })
    }

    availability.timeSlots = timeSlots

    await availability.save()
    return availability
  }

  /**
   * Retrieves the availability record for a specific user in a specific group.
   *
   * @param {object} userId - The ID of the user to retrieve availability for (string or MongoDB ObjectId)
   * @param {object} groupId - The ID of the group to retrieve availability from (string or MongoDB ObjectId)
   * @returns {Promise<object|null>} A promise that resolves to the availability document if found, or null if no record exists
   */
  async getUserAvailability (userId, groupId) {
    return AvailabilityModel.findOne({ user: userId, group: groupId })
  }

  /**
   * Retrieves availability records for all users in a specified group.
   *
   * @param {object} groupId - The ID of the group to retrieve availability for
   * @returns {Promise<Array>} A promise that resolves to an array of populated availability documents
   * Each document includes basic user information (username, firstname, lastname)
   */
  async getGroupAvailability (groupId) {
    return AvailabilityModel.find({ group: groupId })
      .populate('user', 'username firstname lastname')
  }

  /**
   * Finds common availability time slots for a group where at least the minimum.
   * number of members are available simultaneously.
   *
   * @param {string} groupId - The ID of the group to check.
   * @param {number|null} minRequiredMembers - Minimum number of members required to be available (defaults to all).
   * @returns {Array} - Array of overlapping time slots with users.
   */
  async findCommonAvailability (groupId, minRequiredMembers = null) {
    // Get all availability records for the group
    const memberAvailabilities = await this.getGroupAvailability(groupId)

    // Return empty array if no availabilities found
    if (memberAvailabilities.length === 0) {
      return []
    }

    const requiredMemberCount = this.#determineRequiredMemberCount(memberAvailabilities, minRequiredMembers)
    const allMemberTimeSlots = this.#extractMemberTimeSlots(memberAvailabilities)
    const overlappingTimeSlots = this.#findOverlappingTimeSlots(allMemberTimeSlots, requiredMemberCount)

    return overlappingTimeSlots
  }

  /**
   * Determines the minimum number of members required for an overlap to be valid.
   *
   * @param {Array} memberAvailabilities - Array of availability records.
   * @param {number|null} minMembers - Requested minimum number of members.
   * @returns {number} - The actual minimum number of members to use.
   */
  #determineRequiredMemberCount (memberAvailabilities, minMembers) {
    // If no minimum specified or requested minimum exceeds total members,
    // use total available members as minimum
    if (minMembers === null || minMembers > memberAvailabilities.length) {
      return memberAvailabilities.length
    }
    return minMembers
  }

  /**
   * Extracts all time slots from availability records and normalizes them.
   *
   * @param {Array} memberAvailabilities - Array of availability records.
   * @returns {Array} - Sorted array of all time slots.
   */
  #extractMemberTimeSlots (memberAvailabilities) {
    const memberTimeSlots = []

    // Iterate through all availability records and their time slots
    memberAvailabilities.forEach(memberAvailability => {
      memberAvailability.timeSlots.forEach(timeSlot => {
        memberTimeSlots.push({
          user: memberAvailability.user._id,
          start: new Date(timeSlot.start),
          end: new Date(timeSlot.end)
        })
      })
    })

    // Sort time slots by start time
    return memberTimeSlots.sort((a, b) => a.start - b.start)
  }

  /**
   * Finds all valid overlapping time slots.
   *
   * @param {Array} memberTimeSlots - Array of all time slots.
   * @param {number} requiredMemberCount - Minimum members required for valid overlap.
   * @returns {Array} - Array of valid overlapping time slots.
   */
  #findOverlappingTimeSlots (memberTimeSlots, requiredMemberCount) {
    const overlaps = []

    // Iterate through each time slot
    for (let i = 0; i < memberTimeSlots.length; i++) {
      const baseTimeSlot = memberTimeSlots[i]
      // Find all users with overlapping availability and the latest end time
      const { availableMembers, overlapEndTime } = this.#findAvailableMembersForSlot(memberTimeSlots, i)

      // Add to results if minimum number of users requirement is met
      if (availableMembers.size >= requiredMemberCount) {
        overlaps.push({
          start: baseTimeSlot.start,
          end: overlapEndTime,
          user: Array.from(availableMembers)
        })
      }
    }

    return overlaps
  }

  /**
   * Finds all users whose time slots overlap with the current slot.
   *
   * @param {Array} memberTimeSlots - Array of all time slots.
   * @param {number} baseSlotIndex - Index of the current time slot.
   * @returns {object} - Object with overlapping users and latest end time.
   */
  #findAvailableMembersForSlot (memberTimeSlots, baseSlotIndex) {
    const baseTimeSlot = memberTimeSlots[baseSlotIndex]
    // Start with the current user
    const availableMembers = new Set([baseTimeSlot.user.toString()])
    // Initialize end boundary with current slot's end time
    let overlapEndTime = baseTimeSlot.end

    // Check all other time slots for overlaps
    for (let j = 0; j < memberTimeSlots.length; j++) {
      // Skip comparing the slot to itself
      if (baseSlotIndex === j) continue

      const compareTimeSlot = memberTimeSlots[j]
      // Check if this slot overlaps with the current one
      if (this.#doTimeSlotsOverlap(compareTimeSlot, baseTimeSlot, overlapEndTime)) {
        // Add user to the set of overlapping users
        availableMembers.add(compareTimeSlot.user.toString())
        // Update the end boundary to the earliest end time
        // This ensures we only count the actual overlapping period
        overlapEndTime = new Date(Math.min(overlapEndTime, compareTimeSlot.end))
      }
    }

    return { availableMembers, overlapEndTime }
  }

  /**
   * Determines if two time slots overlap.
   *
   * @param {object} compareSlot - Time slot being compared.
   * @param {object} baseSlot - Base time slot.
   * @param {Date} currentEnd - Current end boundary.
   * @returns {boolean} - True if slots overlap.
   */
  #doTimeSlotsOverlap (compareSlot, baseSlot, currentEnd) {
    // Slots overlap if:
    // 1. compareSlot starts before or at the current end boundary
    // 2. AND compareSlot ends after or at baseSlot's start time
    return compareSlot.start <= currentEnd && compareSlot.end >= baseSlot.start
  }
}
