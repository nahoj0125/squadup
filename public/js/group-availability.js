console.log('Common availability script loaded');

document.addEventListener('DOMContentLoaded', function() {
  // Current week date tracking
  let currentWeekStart = new Date();
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start with Monday
  currentWeekStart.setHours(0, 0, 0, 0);
  
  // Initialize the calendar with the current week
  updateCalendarDates();

  const commonAvailabilityData = document.getElementById('common-availability-data').textContent;

  
  // Initialize with common availability data
  const commonAvailability = JSON.parse(commonAvailabilityData);

  updateAvailabilityDisplay(commonAvailability);
  
  // Week navigation buttons
  document.getElementById('prev-week').addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateCalendarDates();
    updateAvailabilityDisplay(commonAvailability);
  });
  
  document.getElementById('next-week').addEventListener('click', function() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateCalendarDates();
    updateAvailabilityDisplay(commonAvailability);
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
  
  // Function to show common availability data on the calendar
  function updateAvailabilityDisplay(availabilityData) {
    console.log('Updating availability display with data:', availabilityData);
    console.log('Current week start:', currentWeekStart);
    
    // Reset all cells
    document.querySelectorAll('.time-cell').forEach(cell => {
      cell.className = 'time-cell';
      cell.querySelector('.availability-count').textContent = '';
    });
    
    // Create a map to count available users for each time slot
    const availabilityMap = new Map();
    
    // Process each common availability entry
    availabilityData.forEach(slot => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      const userCount = slot.user.length;
      
      console.log('Processing slot:', {
        start: start.toString(),
        end: end.toString(),
        userCount,
        users: slot.user
      });
      
      // For each hour in the time range
      for (let time = new Date(start); time < end; time.setHours(time.getHours() + 1)) {
        const slotWeekDay = time.getDay() === 0 ? 6 : time.getDay() - 1; // Convert to 0-6 (Mon-Sun)
        const slotHour = time.getHours();
        
        console.log('Checking time slot:', {
          time: time.toString(),
          weekDay: slotWeekDay,
          hour: slotHour
        });
        
        // Check if this slot is in the current week view
        const slotWeekStart = new Date(time);
        slotWeekStart.setDate(slotWeekStart.getDate() - slotWeekDay);
        slotWeekStart.setHours(0, 0, 0, 0);
        
        console.log('Comparing week starts:', {
          slotWeekStart: slotWeekStart.toString(),
          currentWeekStart: currentWeekStart.toString(),
          matches: slotWeekStart.getTime() === currentWeekStart.getTime()
        });
        
        if (slotWeekStart.getTime() === currentWeekStart.getTime() && 
            slotHour >= 8 && slotHour < 22) {
          
          const key = `${slotWeekDay}-${slotHour}`;
          console.log('Adding to availability map with key:', key);
          
          if (!availabilityMap.has(key)) {
            availabilityMap.set(key, { count: 0, user: [] });
          }
          
          const data = availabilityMap.get(key);
          data.count = Math.max(data.count, userCount);
          data.user = slot.user;
          availabilityMap.set(key, data);
        }
      }
    });
    
    console.log('Final availability map:', Array.from(availabilityMap.entries()));
    
    // Update the cells based on the availability map
    availabilityMap.forEach((data, key) => {
      const [day, hour] = key.split('-').map(Number);
      const cell = document.querySelector(`.time-cell[data-day="${day}"][data-hour="${hour}"]`);
      
      console.log('Updating cell for key:', key, 'with data:', data);
      
      if (cell) {
        cell.classList.add(`availability-level-${Math.min(data.count, 3)}`);
        cell.querySelector('.availability-count').textContent = data.count;
        
        // Store user IDs for potential tooltip or details view
        cell.dataset.user = data.user.join(',');
      } else {
        console.warn('Could not find cell for day:', day, 'hour:', hour);
      }
    });
    
    // Update the best times list
    updateBestTimesList(availabilityMap);
  }
  
  // Function to show a list of the best times to meet
  function updateBestTimesList(availabilityMap) {
    const bestTimesContainer = document.getElementById('best-times-list');
    
    // Convert the map to an array and sort by count (descending)
    const sortedTimes = Array.from(availabilityMap.entries())
      .map(([key, data]) => {
        const [day, hour] = key.split('-').map(Number);
        return { day, hour, ...data };
      })
      .sort((a, b) => b.count - a.count);
    
    if (sortedTimes.length === 0) {
      bestTimesContainer.innerHTML = '<p class="no-times-message">No common availability found for this week.</p>';
      return;
    }
    
    // Take top 5 times or fewer if not enough
    const bestTimes = sortedTimes.slice(0, 5);
    
    // Create HTML for the best times list
    let html = '<ul class="best-times-list">';
    
    bestTimes.forEach(time => {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + time.day);
      
      const dayName = day.toLocaleString('default', { weekday: 'long' });
      const dayDate = day.toLocaleString('default', { month: 'short', day: 'numeric' });
      const formattedHour = time.hour > 12 ? 
        `${time.hour - 12}:00 PM` : 
        `${time.hour}:00 AM`;
      
      html += `
        <li class="best-time-item availability-level-${Math.min(time.count, 3)}">
          <div class="best-time-info">
            <span class="best-time-day">${dayName}, ${dayDate}</span>
            <span class="best-time-hour">${formattedHour}</span>
          </div>
          <div class="best-time-count">${time.count} ${time.count === 1 ? 'person' : 'people'} available</div>
        </li>
      `;
    });
    
    html += '</ul>';
    bestTimesContainer.innerHTML = html;
  }
});