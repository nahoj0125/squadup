/**
 * Group Availability Calendar
 *
 * This script manages the display and interaction with the group availability calendar.
 * It shows overlapping time slots among group members and highlights the current user's availability.
 *
 * @author Johan Persson
 */

document.addEventListener('DOMContentLoaded', function () {
  // Parse the data from the embedded JSON
  const commonTimesData = JSON.parse(document.getElementById('common-availability-data').textContent)
  const currentUserId = document.getElementById('current-user-id').textContent

  // Setup current week
  const today = new Date()
  const currentWeekStart = getMonday(today)
  updateWeekDisplay()

  // Initialize calendar with data
  initializeCalendar(commonTimesData)

  // Add event listeners for week navigation
  document.getElementById('prev-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
    updateWeekDisplay()
    updateCalendarForWeek()
  })

  document.getElementById('next-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    updateWeekDisplay()
    updateCalendarForWeek()
  })

  /**
   * Initializes the calendar with the provided time slot data.
   * This function processes the data, filters it for the current week,
   * and populates the calendar cells with appropriate styling based on availability.
   *
   * @param {Array} timeSlotsData - Array of time slot objects containing start times, end times, and user IDs
   */
  function initializeCalendar (timeSlotsData) {
  // Clear existing cell classes
    document.querySelectorAll('.time-cell').forEach(cell => {
      cell.className = 'time-cell'
      cell.querySelector('.availability-count').textContent = ''
    })

    // Group time slots by day and hour
    const slotsByDayAndHour = {}

    timeSlotsData.forEach(slot => {
      const start = new Date(slot.start)
      let end = new Date(slot.end)

      // Fix slots with zero duration by setting end time to 1 hour after start
      if (end.getTime() <= start.getTime()) {
        end = new Date(start)
        end.setHours(end.getHours() + 1)
      }

      // Skip slots outside current week
      if (!isInCurrentWeek(start)) return

      const day = start.getDay() === 0 ? 6 : start.getDay() - 1 // Convert to Monday=0 format

      // For each hour in the slot
      for (let h = start.getHours(); h < end.getHours(); h++) {
        const key = `${day}-${h}`

        if (!slotsByDayAndHour[key]) {
          slotsByDayAndHour[key] = {
            count: 0,
            users: []
          }
        }

        // Add all users for this slot
        slot.user.forEach(userId => {
          if (!slotsByDayAndHour[key].users.includes(userId)) {
            slotsByDayAndHour[key].users.push(userId)
            slotsByDayAndHour[key].count++
          }
        })

        // Mark if current user is available
        if (slot.user.includes(currentUserId)) {
          slotsByDayAndHour[key].includesCurrentUser = true
        }
      }
    })

    // Apply classes to cells based on availability
    Object.entries(slotsByDayAndHour).forEach(([key, data]) => {
      const [day, hour] = key.split('-').map(Number)
      const cell = document.querySelector(`.time-cell[data-day="${day}"][data-hour="${hour}"]`)

      if (cell) {
        // Apply class based on number of people
        if (data.count === 1) {
          cell.classList.add('one-person')
        } else if (data.count === 2) {
          cell.classList.add('two-people')
        } else if (data.count >= 3) {
          cell.classList.add('three-plus-people')
        }

        // Mark user's own availability
        if (data.includesCurrentUser) {
          cell.classList.add('your-availability')
        }

        // Show count in cell
        cell.querySelector('.availability-count').textContent = data.count
      }
    })

    // Update best times list
    updateBestTimesList(timeSlotsData)
  }

  /**
   * Updates the calendar to display only slots for the current week.
   * This function is called when the user navigates between weeks.
   */
  function updateCalendarForWeek () {
    initializeCalendar(commonTimesData)
  }

  /**
   * Determines if a given date falls within the currently displayed week.
   *
   * @param {Date} date - The date to check
   * @returns {boolean} - True if the date is in the current week, false otherwise
   */
  function isInCurrentWeek (date) {
    const endOfWeek = new Date(currentWeekStart)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    return date >= currentWeekStart && date < endOfWeek
  }

  /**
   * Update the week display header.
   */
  function updateWeekDisplay () {
    const options = { month: 'long', day: 'numeric' }

    // Get end of week date
    const endOfWeek = new Date(currentWeekStart)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    // Format dates
    const startStr = currentWeekStart.toLocaleDateString('en-US', options)
    const endStr = endOfWeek.toLocaleDateString('en-US', options)

    // Update display
    document.getElementById('current-week-display').textContent = `Week of ${startStr} - ${endStr}`

    // Update day labels with specific dates
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayLabels = document.querySelectorAll('.day-label')

    // Skip the first one (it's the empty corner cell)
    for (let i = 1; i < dayLabels.length; i++) {
      const dayDate = new Date(currentWeekStart)
      dayDate.setDate(dayDate.getDate() + (i - 1))
      const dayNum = dayDate.getDate()

      dayLabels[i].textContent = `${days[i - 1]} ${dayNum}`
    }
  }

  /**
   * Updates the "Best Times" list to show the top 5 time slots
   * with the most available users for the current week.
   *
   * @param {Array} timeSlotsData - Array of time slot objects
   */
  function updateBestTimesList (timeSlotsData) {
    const bestTimesContainer = document.getElementById('best-times-list')
    bestTimesContainer.innerHTML = ''

    // Filter slots for current week
    const weekSlots = timeSlotsData.filter(slot =>
      isInCurrentWeek(new Date(slot.start))
    )

    if (weekSlots.length === 0) {
      bestTimesContainer.innerHTML = '<p class="no-times-message">No available times found for this week.</p>'
      return
    }

    // Sort by number of available users (descending)
    const sortedSlots = [...weekSlots].sort((a, b) => {
      // Sort by user count first
      if (b.user.length !== a.user.length) {
        return b.user.length - a.user.length
      }
      // Then by start time
      return new Date(a.start) - new Date(b.start)
    })

    // Create the best times list
    const listEl = document.createElement('ul')
    listEl.className = 'best-times-list'

    sortedSlots.slice(0, 5).forEach(slot => {
      const li = document.createElement('li')
      const startTime = new Date(slot.start)
      const endTime = new Date(slot.end)

      const weekday = startTime.toLocaleDateString('en-US', { weekday: 'long' })
      const startTimeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

      // Choose class based on number of users
      if (slot.user.length === 1) {
        li.className = 'one-person'
      } else if (slot.user.length === 2) {
        li.className = 'two-people'
      } else {
        li.className = 'three-plus-people'
      }

      // Add 'your-availability' class if user is available
      if (slot.user.includes(currentUserId)) {
        li.classList.add('your-availability')
      }

      li.innerHTML = `
        <div class="best-time-weekday">${weekday}</div>
        <div class="best-time-hours">${startTimeStr} - ${endTimeStr}</div>
        <div class="best-time-count">${slot.user.length} ${slot.user.length === 1 ? 'person' : 'people'}</div>
      `
      listEl.appendChild(li)
    })

    bestTimesContainer.appendChild(listEl)
  }

  /**
   * Gets the Monday of the week containing the provided date.
   * This is used as the start date for displaying a week's worth of availability.
   *
   * @param {Date} date - The reference date
   * @returns {Date} - The Monday (00:00:00) of the week containing the reference date
   */
  function getMonday (date) {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    const monday = new Date(date)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }
})
