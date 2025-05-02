document.addEventListener('DOMContentLoaded', function () {
  const commonTimesData = JSON.parse(document.getElementById('common-availability-data').textContent)
  const currentUserId = document.getElementById('current-user-id').textContent

  const today = new Date()
  const currentWeekStart = getMonday(today)
  updateWeekDisplay()

  initializeCalendar(commonTimesData)

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
   *
   */
  function initializeCalendar (timeSlotsData) {
    document.querySelectorAll('.time-cell').forEach(cell => {
      cell.className = 'time-cell'
      cell.querySelector('.availability-count').textContent = ''
    })

    const slotsByDayAndHour = {}

    timeSlotsData.forEach(slot => {
      const start = new Date(slot.start)
      const end = new Date(slot.end)

      if (!isInCurrentWeek(start)) return

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

        if (slot.user.includes(currentUserId)) {
          slotsByDayAndHour[key].includesCurrentUser = true
        }
      }
    })

    Object.entries(slotsByDayAndHour).forEach(([key, data]) => {
      const [day, hour] = key.split('-').map(Number)
      const cell = document.querySelector(`.time-cell[data-day="${day}"][data-hour="${hour}"]`)

      if (cell) {
        if (data.count === 1) {
          cell.classList.add('one-person')
        } else if (data.count === 2) {
          cell.classList.add('two-people')
        } else if (data.count >= 3) {
          cell.classList.add('three-plus-people')
        }

        if (data.includesCurrentUser) {
          cell.classList.add('your-availability')
        }

        cell.querySelector('.availability-count').textContent = data.count
      }
    })

    updateBestTimesList(timeSlotsData)
  }

  /**
   *
   */
  function updateCalendarForWeek () {
    initializeCalendar(commonTimesData)
  }

  /**
   *
   */
  function isInCurrentWeek (date) {
    const endOfWeek = new Date(currentWeekStart)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    return date >= currentWeekStart && date < endOfWeek
  }

  /**
   *
   */
  function updateWeekDisplay () {
    const options = { month: 'long', day: 'numeric' }

    const endOfWeek = new Date(currentWeekStart)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    const startStr = currentWeekStart.toLocaleDateString('en-US', options)
    const endStr = endOfWeek.toLocaleDateString('en-US', options)

    document.getElementById('current-week-display').textContent = `Week of ${startStr} - ${endStr}`

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dayLabels = document.querySelectorAll('.day-label')

    for (let i = 1; i < dayLabels.length; i++) {
      const dayDate = new Date(currentWeekStart)
      dayDate.setDate(dayDate.getDate() + (i - 1))
      const dayNum = dayDate.getDate()

      dayLabels[i].textContent = `${days[i - 1]} ${dayNum}`
    }
  }

  /**
   *
   */
  function updateBestTimesList (timeSlotsData) {
    const bestTimesContainer = document.getElementById('best-times-list')
    bestTimesContainer.innerHTML = ''

    const weekSlots = timeSlotsData.filter(slot =>
      isInCurrentWeek(new Date(slot.start))
    )

    if (weekSlots.length === 0) {
      bestTimesContainer.innerHTML = '<p class="no-times-message">No available times found for this week.</p>'
      return
    }

    const sortedSlots = [...weekSlots].sort((a, b) => {
      if (b.user.length !== a.user.length) {
        return b.user.length - a.user.length
      }
      return new Date(a.start) - new Date(b.start)
    })

    const listEl = document.createElement('ul')
    listEl.className = 'best-times-list'

    sortedSlots.slice(0, 5).forEach(slot => {
      const li = document.createElement('li')
      const startTime = new Date(slot.start)
      const endTime = new Date(slot.end)

      const weekday = startTime.toLocaleDateString('en-US', { weekday: 'long' })
      const startTimeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      const endTimeStr = endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

      if (slot.user.length === 1) {
        li.className = 'one-person'
      } else if (slot.user.length === 2) {
        li.className = 'two-people'
      } else {
        li.className = 'three-plus-people'
      }

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
   *
   */
  function getMonday (date) {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(date)
    monday.setDate(diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  }
})
