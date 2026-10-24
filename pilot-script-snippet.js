// Apply these changes to pilot.html's existing inline script.
// 1) In finish(), add selectedOptionLabel to each response object:
// selectedOptionLabel: Number.isInteger(answers[q.id]) ? String(q.options[answers[q.id]]) : null,
// Keep selectedOptionIndex if you still need it for local exports; the server stores the label.
// 2) Add this handler near the existing exportBtn/restartBtn listeners.

$('researchUploadConsent').addEventListener('change', () => {
  $('submitCloudBtn').disabled = !$('researchUploadConsent').checked;
});
$('submitCloudBtn').addEventListener('click', async () => {
  const status = $('cloudSubmitStatus');
  const button = $('submitCloudBtn');
  if (!$('researchUploadConsent').checked) {
    status.textContent = 'Select the separate research-upload consent checkbox first.';
    return;
  }
  if (!window.openiqLocalResult || !window.OpenIQDatabase) {
    status.textContent = 'Secure upload code is not available. Export your result locally instead.';
    return;
  }
  button.disabled = true;
  status.textContent = 'Submitting securely…';
  try {
    const result = await window.OpenIQDatabase.submitSession(window.openiqLocalResult, {
      researchConsent: true,
      deviceClass: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    });
    status.textContent = `Submission confirmed. Saved ${result.savedResponses} item responses. Reference: ${result.sessionId}`;
  } catch (error) {
    status.textContent = `${error.message || 'Submission failed.'} Your local JSON export remains available.`;
    button.disabled = !$('researchUploadConsent').checked;
  }
});
