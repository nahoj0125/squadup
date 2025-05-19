/**
 * Group Availability Calendar
 *
 * This script manages the display and interaction with the group availability calendar.
 * It shows overlapping time slots among group members and highlights the current user's availability.
 *
 * @author Johan Persson
 */

document.addEventListener('DOMContentLoaded', function () {
  const calendar = {
    currentWeekStart: null,
    currentTimesData: null,
    currentUserId: null,
    elements: {
      commonTimesElement: document.getElementById('common-availability-data'),
      currentUserElement: document.getElementById('current-user-id'),
      weekDisplay: document.getElementById('current-week-display'),
      prevWeekBtn: document.getElementById('prev-week'),
      nextWeekBtn: document.getElementById('next-week'),
      bestTimesList: document.getElementById('best-times-list')
    }
  }

  /**
   * Initialize the calendar with data and set up event handlers.
   */
  function init () {
    if (!calendar.elements.commonTimesElement || !calendar.elements.currentUserElement) {
      console.error('Required elements not found for calendar initialization')
    }

    calendar.commonTimesData = JSON.parse(calendar.elements.commonTimesElement.textContent)
    calendar.currentUserId = calendar.elements.currentUserElement.textContent

    const currentDay = new Date()
    calendar.currentWeekStart = getMonday(currentDay)

    updateWeekDisplay()
    initializeCalendar(calendar.commonTimesData)

    setupEventListners()
  }

  /**
   * Set up event listeners for previous and next week navigation buttons.
   */
  function setupEventListners () {
    calendar.elements.prevWeekBtn.addEventListener('click', () => {
      navigateWeek(-7)
    })

    calendar.elements.nextWeekBtn.addEventListener('click', () => {
      navigateWeek(7)
    })
  }

  /**
   * Navigate forward or backward by the specified number of days.
   * Updates the calendar view after navigation.
   *
   * @param {number} days - Number of days to navigate (positive for forward, negative for backward)
   */
  function navigateWeek (days) {
    calendar.currentWeekStart.setDate(calendar.currentWeekStart.getDate() + days)
    updateWeekDisplay()
    updateCalendarForWeek()
  }

  /**
   * Initialize the calendar with time slot data.
   * Clears existing cell data, processes time slots, and updates UI.
   *
   * @param {Array} timeSlotsData - Array of time slot objects containing start times, end times, and user IDs
   */
  function initializeCalendar (timeSlotsData) {
    document.querySelectorAll('.time-cell').forEach(cell => {
      cell.className = 'time-cell'
      cell.querySelector('.availability-count').textContent = ''
    })

    const SlotByDayAndHour = processTimeSlots(timeSlotsData)

    applyAvailabilityToCalendar(SlotByDayAndHour)

    updateBestTimesList(timeSlotsData)
  }

  /**
   * Process time slots and group them by day and hour.
   * Filters slots for current week and builds a lookup object for easy access.
   *
   * @param {Array} timeSlotsData - Array of time slot objects
   * @returns {object} Object with keys in 'day-hour' format, containing user counts and IDs
   */
  function processTimeSlots (timeSlotsData) {
    const slotsByDayAndHour = {}

    timeSlotsData.forEach(slot => {
      const start = new Date(slot.start)
      let end = new Date(slot.end)

      // Fix slots with zero duration by setting end time to 1 hour after start
      if (end.getTime() <= start.getTime()) {
        end = new Date(start)
        end.setHours(end.getHours() + 1)
      }

      if (!isInCurrentWeek(start)) return

      // Convert to Monday = 0 format
      const day = start.getDay() === 0 ? 6 : start.getDay() - 1

      for (let h = start.getHours(); h < end.getHours(); h++) {
        const key = `${day}-${h}`

        if (!slotsByDayAndHour[key]) {
          slotsByDayAndHour[key] = {
            count: 0,
            users: []
          }
        }

        slot.user.forEach(userId => {
          if (!slotsByDayAndHour[key].users.includes(userId)) {
            slotsByDayAndHour[key].users.push(userId)
            slotsByDayAndHour[key].count++
          }
        })

        if (slot.user.includes(calendar.currentUserId)) {
          slotsByDayAndHour[key].includesCurrentUser = true
        }
      }
    })

    return slotsByDayAndHour
  }

  /**
   * Apply availability data to calendar cells in the DOM.
   *
   * @param {object} slotsByDayAndHour - Processed slots by day and hour from processTimeSlots()
   */
  function applyAvailabilityToCalendar (slotsByDayAndHour) {
    Object.entries(slotsByDayAndHour).forEach(([key, data]) => {
      const [day, hour] = key.split('-').map(Number)
      const cell = document.querySelector(`.time-cell[data-day="${day}"][data-hour="${hour}"]`)

      if (cell) {
        applyStyleToCell(cell, data)
      }
    })
  }

  /**
   * Apply appropriate CSS classes and content to a calendar cell based on availability data.
   *
   * @param {HTMLElement} cell - The calendar cell DOM element
   * @param {object} data - Availability data for this cell
   * @param {number} data.count - Number of users available in this slot
   * @param {boolean} data.includesCurrentUser - Whether current user is available
   */
  function applyStyleToCell (cell, data) {
    if (data.count === 1) {
      cell.classList.add('one-person')
    } else if (data.count === 2) {
      cell.classList.add('two-people')
    } else if (data.count === 3) {
      cell.classList.add('three-plus-people')
    }

    if (data.includesCurrentUser) {
      cell.classList.add('your-availability')
    }

    cell.querySelector('.availability-count').textContent = data.count
  }

  /**
   * Update the calendar to display only slots for the current week.
   * Called when the user navigates between weeks.
   */
  function updateCalendarForWeek () {
    initializeCalendar(calendar.commonTimesData)
  }

  /**
   * Determines if a given date falls within the currently displayed week.
   *
   * @param {Date} date - The date to check
   * @returns {boolean} True if the date is in the current week, false otherwise
   */
  function isInCurrentWeek (date) {
    const endOfWeek = new Date(calendar.currentWeekStart)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    return date >= calendar.currentWeekStart && date < endOfWeek
  }

  /**
   * Update the week display header with formatted date range.
   * Also triggers update of day labels.
   */
  function updateWeekDisplay () {
    const options = { month: 'long', day: 'numeric' }

    const endOfWeek = new Date(calendar.currentWeekStart)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    const startStr = calendar.currentWeekStart.toLocaleDateString('en-US', options)
    const endStr = endOfWeek.toLocaleDateString('en-US', options)

    calendar.elements.weekDisplay.textContent = `Week of ${startStr} - ${endStr}`

    updateDayLabels()
  }

  /**
   * Update the day labels with specific dates for the current week.
   */
  function updateDayLabels () {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayLabels = document.querySelectorAll('.day-label')

    for (let i = 1; i < dayLabels.length; i++) {
      const dayDate = new Date(calendar.currentWeekStart)
      dayDate.setDate(dayDate.getDate() + (i - 1))
      const dayNum = dayDate.getDate()

      dayLabels[i].textContent = `${days[i - 1]} ${dayNum}`
    }
  }

  /**
   * Updates the "Best Times" list to show only the single best time slot
   * with the most available users for the current week.
   *
   * @param {Array} timeSlotsData - Array of time slot objects
   */
  function updateBestTimesList (timeSlotsData) {
    calendar.elements.bestTimesList.innerHTML = ''

    const weekSlots = timeSlotsData.filter(slot =>
      isInCurrentWeek(new Date(slot.start))
    )

    if (weekSlots.length === 0) {
      calendar.elements.bestTimesList.innerHTML = '<p class="no-times-message">No available times found for this week.</p>'
      return
    }

    // Get only the best time slot (sorted by user count, then by start time)
    const sortedSlots = getSortedTimeSlots(weekSlots)
    const bestTimeSlot = sortedSlots[0]

    // Create and display the single best time
    const bestTimeElement = createBestTimeElement(bestTimeSlot)
    calendar.elements.bestTimesList.appendChild(bestTimeElement)

    // Highlight this time in the calendar
    highlightBestTimeInCalendar(bestTimeSlot)
  }

  /**
   * Highlights the best time slot in the calendar with a special class.
   *
   * @param {object} slot - The best time slot
   */
  function highlightBestTimeInCalendar (slot) {
    // Remove any existing best-time highlights
    document.querySelectorAll('.best-time-highlight').forEach(cell => {
      cell.classList.remove('best-time-highlight')
    })

    const startTime = new Date(slot.start)
    // Convert to Monday = 0 format
    const day = startTime.getDay() === 0 ? 6 : startTime.getDay() - 1
    const hour = startTime.getHours()

    const cell = document.querySelector(`.time-cell[data-day="${day}"][data-hour="${hour}"]`)
    if (cell) {
      cell.classList.add('best-time-highlight')
    }
  }

  /**
   * Sort time slots by user count (descending) and then by start time.
   *
   * @param {Array} weekSlots - Time slots for the current week
   * @returns {Array} Sorted array of time slots
   */
  function getSortedTimeSlots (weekSlots) {
    return [...weekSlots.sort((a, b) => {
      if (b.user.length !== a.user.length) {
        return b.user.length - a.user.length
      }
      return new Date(a.start) - new Date(b.start)
    })]
  }

  /**
   * Create a single best time element with enhanced styling.
   *
   * @param {object} slot - Time slot data
   * @param {string} slot.start - Start time in ISO format
   * @param {string} slot.end - End time in ISO format
   * @param {Array} slot.user - Array of user IDs available in this slot
   * @returns {HTMLElement} Best time element
   */
  function createBestTimeElement (slot) {
    const container = document.createElement('div')
    container.className = 'best-time-container'

    const startTime = new Date(slot.start)
    const endTime = new Date(slot.end)

    const weekday = startTime.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = startTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const startTimeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

    // Add class based on number of users
    if (slot.user.length === 1) {
      container.classList.add('one-person')
    } else if (slot.user.length === 2) {
      container.classList.add('two-people')
    } else {
      container.classList.add('three-plus-people')
    }

    // Add highlight class if current user is available in this slot
    if (slot.user.includes(calendar.currentUserId)) {
      container.classList.add('includes-you')
    }

    container.innerHTML = `
      <div class="best-time-header">
        <span class="best-time-weekday">${weekday}</span>, <span class="best-time-date">${dateStr}</span>
      </div>
      <div class="best-time-time">
        <span class="best-time-hours">${startTimeStr} - ${endTimeStr}</span>
      </div>
      <div class="best-time-count">${slot.user.length} ${slot.user.length === 1 ? 'person' : 'people'} available</div>
    `

    // Add some custom styles for the best time display
    const style = document.createElement('style')
    style.textContent = `
      .best-time-container {
        background-color: #f5f9f7;
        border-left: 4px solid #74b9a3;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .best-time-container.three-plus-people {
        border-left-color: #74b9a3;
      }
      
      .best-time-container.two-people {
        border-left-color: #97cdb9;
      }
      
      .best-time-container.one-person {
        border-left-color: #c5e1d8;
      }
      
      .best-time-container.includes-you {
        background-color: #ebf6f1;
      }
      
      .best-time-header {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .best-time-weekday, .best-time-date {
        color: #2a7d63;
      }
      
      .best-time-time {
        margin-bottom: 5px;
        font-size: 1.1em;
      }
      
      .best-time-count {
        color: #555;
      }
      
      .best-time-highlight {
        border: 3px solid #2a7d63 !important;
        box-shadow: 0 0 5px rgba(42, 125, 99, 0.4);
        z-index: 2;
        position: relative;
      }
    `
    document.head.appendChild(style)

    return container
  }

  /**
   * Gets the Monday of the week containing the provided date.
   * Used as the start date for displaying a week's worth of availability.
   *
   * @param {Date} date - The reference date
   * @returns {Date} The Monday (00:00:00) of the week containing the reference date
   */
  function getMonday (date) {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)

    return monday
  }

  init()
})
