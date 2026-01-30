name: Bug Report
description: Report a bug to help us improve the project
title: "[BUG] "
labels: ["bug"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report! Please provide as much detail as possible to help us understand and reproduce the issue.

  - type: textarea
    id: bug-description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is
      placeholder: Describe the bug in detail...
    validations:
      required: true

  - type: textarea
    id: steps-to-reproduce
    attributes:
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: Expected Behavior
      description: A clear and concise description of what you expected to happen
      placeholder: What should have happened?
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: Actual Behavior
      description: A clear and concise description of what actually happened
      placeholder: What actually happened?
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: Severity
      description: How severe is this bug?
      options:
        - Low (doesn't block work)
        - Medium (causes inconvenience)
        - High (significantly affects functionality)
        - Critical (blocks major functionality)
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: Please provide information about your environment
      placeholder: |
        - OS: [e.g. iOS]
        - Browser [e.g. chrome, safari]
        - Version [e.g. 22]
        - Node.js version [if applicable]
    validations:
      required: true

  - type: textarea
    id: error-logs
    attributes:
      label: Error Logs
      description: Please paste any relevant error logs here
      placeholder: |
        ```
        [Paste logs here]
        ```
    validations:
      required: false

  - type: textarea
    id: additional-context
    attributes:
      label: Additional Context
      description: Add any other context about the problem here
      placeholder: screenshots, code samples, etc.
    validations:
      required: false