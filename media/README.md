# Media

Drop captured assets here, then set the matching `src` in `main.js` → `MEDIA`.
Placeholders stay until a `src` is provided.

| Key in main.js | Suggested file | What |
|---|---|---|
| `roverDriveVideo` | `rover-drive.mp4` | rover driving itself, no hands |
| `mappingVideo` | `mapping.mp4` | occupancy map filling in (Foxglove) |
| `dashboardVideo` | `dashboard.mp4` | web dashboard / telemetry |
| `mapImage` | `map.png` | clean saved occupancy map |

Keep videos short, muted, H.264 MP4. A rover render can also replace the hero
diagram later (swap the inline `<svg>` in `index.html`).
