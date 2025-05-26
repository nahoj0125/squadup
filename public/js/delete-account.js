// delete-account.js
// Client-side JavaScript for account deletion functionality

document.addEventListener('DOMContentLoaded', function () {
  // Get DOM elements
  const confirmationInput = document.getElementById('confirmation')
  const deleteBtn = document.getElementById('delete-btn')
  const deleteForm = document.getElementById('delete-account-form')

  // Get data from JSON script element
  const data = JSON.parse(document.getElementById('delete-account-data').textContent)
  const expectedUsername = data.username

  // Username validation function
  /**
   * Validates the username entered in the confirmation input and updates the delete button state.
   */
  function validateUsername () {
    const currentValue = confirmationInput.value

    if (currentValue === expectedUsername) {
      deleteBtn.disabled = false
      deleteBtn.textContent = 'Delete My Account Permanently'
    } else {
      deleteBtn.disabled = true
      deleteBtn.textContent = 'Type your username to enable deletion'
    }
  }

  // Listen for input changes on username confirmation
  confirmationInput.addEventListener('input', validateUsername)

  // Handle form submission with confirmation dialog
  deleteForm.addEventListener('submit', function (e) {
    const confirmed = confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')

    if (!confirmed) {
      e.preventDefault()
    }
  })

  // Initial validation check
  validateUsername()
})
