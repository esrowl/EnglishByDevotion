# Local user storage

`backups/current.json` is the most recent successfully saved full snapshot.
`backups/history/` retains previous snapshots before replacement. Nothing in
this directory is automatically deleted. These files contain personal notes
and progress in plain JSON; do not publish or commit them.

The server writes files atomically with private file permissions where the OS
supports them. The browser is still the live database; disk backups are a
second layer, not cloud synchronization. A new, empty browser profile can
restore this snapshot on startup. Existing profiles are never reset.
See `docs/DATA_PORTABILITY.md`.

Historical snapshots can include old external cache even after the active
cache is cleared. The current snapshot reflects the cleanup. Backup histories
consume disk space; inspect/archive them manually when needed.
