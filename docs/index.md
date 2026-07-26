# Project Documentation

This folder contains the deeper documentation for the Jeopardy web app. The README stays focused on a fast project overview; these files provide the working detail for users, facilitators, and maintainers.

## Documentation Map

- [User Guide](user-guide.md): How to create, edit, export, and play games.
- [Facilitator Guide](facilitator-guide.md): How to prepare a session, manage game files, and use answer keys.
- [LLM-Assisted Game Generation](llm-assisted-generation.md): How to use the included prompt file with source material to draft game boards.
- [File Format Reference](file-format.md): The text file format used for drafts and complete games.
- [Export Workflow](export-workflow.md): How `Export Draft`, `Export Game`, and the answer key print flow work.
- [Technical Overview](technical-overview.md): Architecture, state, data flow, and key implementation areas.
- [Code Walkthrough](code-walkthrough.md): Plain-English walkthrough of how the HTML, CSS, and JavaScript work independently and together.
- [Maintenance Guide](maintenance.md): How to update screenshots, validate changes, and safely maintain the app.
- [Known Limitations](known-limitations.md): Browser behaviors, PDF caveats, and current constraints.

## Audience Guide

Use this route if you are playing or facilitating a game:

1. Start with the [User Guide](user-guide.md).
2. Review the [Facilitator Guide](facilitator-guide.md) before running a session.
3. Use [LLM-Assisted Game Generation](llm-assisted-generation.md) if you want help drafting a board from source material.
4. Use the [File Format Reference](file-format.md) if you want to edit game files by hand.

Use this route if you are changing the app:

1. Start with the [Technical Overview](technical-overview.md).
2. Read the [Code Walkthrough](code-walkthrough.md) to understand how the core files work.
3. Review the [Export Workflow](export-workflow.md), because export behavior touches downloads, print dialogs, validation, and browser permissions.
4. Use the [Maintenance Guide](maintenance.md) before updating screenshots or release notes.
5. Check [Known Limitations](known-limitations.md) before changing browser-dependent behavior.
