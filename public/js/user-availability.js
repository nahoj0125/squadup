document.addEventListener('DOMContentLoaded', function() {
  // Current week date tracking
  let currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start with Monday
  currentWeekStart.setHours(0, 0, 0, 0);
  
  // Initialize the calendar with the current week
  updateCalendarDates();
  
  // Initialize with existing availability data if available
  const existingAvailability = JSON.parse(document.getElementById('existing-availability-data').textContent);
  if (existingAvailability.length > 0) {
    loadExistingAvailability(existingAvailability);
  }
  
  // Week navigation buttons
  document.getElementById('prev-week').addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateCalendarDates();
    loadExistingAvailability(existingAvailability);
  });
  
  document.getElementById('next-week').addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateCalendarDates();
    loadExistingAvailability(existingAvailability);
  });
  
  // Handle cell click for selection
  document.querySelectorAll('.time-cell').forEach(cell => {
    cell.addEventListener('click', function() {
      this.classList.toggle('selected');
    });
  });
  
  // Clear all selections
  document.getElementById('clear-all').addEventListener('click', function() {
    document.querySelectorAll('.time-cell').forEach(cell => {
      cell.classList.remove('selected');
    });
  });
  
  // Form submission - serialize the selected times
  document.getElementById('availability-form').addEventListener('submit', function(e) {
    const selectedSlots = [];
    
    document.querySelectorAll('.time-cell.selected').forEach(cell => {
      const dayIndex = parseInt(cell.dataset.day);
      const hour = parseInt(cell.dataset.hour);
      
      // Create date objects for the selected cell
      const startDate = new Date(currentWeekStart);
      startDate.setDate(startDate.getDate() + dayIndex);
      startDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(hour + 1, 0, 0, 0);
      
      selectedSlots.push({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
    });
    
    // Store the serialized data in the hidden input
    document.getElementById('timeSlots-input').value = JSON.stringify(selectedSlots);
  });
  
  // Function to update the calendar dates based on currentWeekStart
  function updateCalendarDates() {
    // Update the week display heading
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const startMonth = currentWeekStart.toLocaleString('default', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
    
    let dateDisplay = `${startMonth} ${currentWeekStart.getDate()}`;
    if (startMonth !== endMonth) {
      dateDisplay += ` - ${endMonth} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    } else {
      dateDisplay += ` - ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    }
    
    document.getElementById('current-week-display').textContent = `Week of ${dateDisplay}`;
    
    // Update day labels with actual dates
    document.querySelectorAll('.day-label').forEach((label, index) => {
      if (index > 0) { // Skip the empty corner cell
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + index - 1);
        
        const dayName = day.toLocaleString('default', { weekday: 'short' });
        const dayDate = day.getDate();
        
        label.textContent = `${dayName} ${dayDate}`;
      }
    });
  }
  
  // Function to load existing availability data onto the calendar
  function loadExistingAvailability(slots) {
    // First clear all selections
    document.querySelectorAll('.time-cell').forEach(cell => {
      cell.classList.remove('selected');
    });
    
    // For each saved time slot, find and select the corresponding cell
    slots.forEach(slot => {
      const start = new Date(slot.start);
      
      // Calculate the day offset from the current week start
      const startWeekDay = start.getDay() === 0 ? 6 : start.getDay() - 1; // Convert to 0-6 (Mon-Sun)
      const startHour = start.getHours();
      
      // Check if this slot is in the current week view
      const slotWeekStart = new Date(start);
      slotWeekStart.setDate(slotWeekStart.getDate() - startWeekDay);
      slotWeekStart.setHours(0, 0, 0, 0);
      
      if (slotWeekStart.getTime() === currentWeekStart.getTime() && 
          startHour >= 8 && startHour < 22) {
        // Find the cell and select it
        const cell = document.querySelector(`.time-cell[data-day="${startWeekDay}"][data-hour="${startHour}"]`);
        if (cell) {
          cell.classList.add('selected');
        }
      }
    });
  }
});