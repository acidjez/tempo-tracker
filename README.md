# BPM Tracker Web App

This project is a React-based BPM (Beats Per Minute) Tracker, allowing users to tap along to the beat of music to calculate and visualize BPM over time. It also supports exporting BPM data as a MIDI file.

Latest Deployment can be found here: https://tempo-tracker.vercel.app/ 

## Features

- **Tap-to-Track BPM**: Measure BPM in real-time by tapping along to a beat.
- **Smooth BPM Calculation**: Adjustable smoothing levels for more stable BPM calculations.
- **Data Visualization**: Interactive chart displaying BPM over time.
- **MIDI Export**: Export BPM data as a MIDI file with customizable settings (e.g., count-in beats and export mode).
- **Keyboard Shortcuts**:
  - Press `Space` to tap.
  - Press `R` or `Escape` to reset.
- **Customizable Display**:
  - Toggle between exact BPM and smoothed average BPM.
  - Adjust smoothing window size.
- **Responsive Design**: Optimized for various screen sizes.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bpm-tracker.git
   ```

2. Navigate to the project directory:
   ```bash
   cd bpm-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the app for production:
```bash
npm run build
```

The optimized production build will be located in the `build` folder.

## Usage

### Tap Functionality
- Click the "Tap" button or press `Space` to input beats.
- BPM values are calculated based on the intervals between taps.

### Reset
- Click the "Reset" button or press `R`/`Escape` to clear all data and start over.

### Smoothness Adjustment
- Use the dropdown to adjust the smoothing window size. Higher values average more data points for a smoother graph.

### MIDI Export
- Customize MIDI export settings:
  - Choose count-in beats (0, 4, 8, or 16).
  - Toggle between exporting every beat or every fourth beat.
- Click "Export as MIDI" to download the file.

## Technologies Used

- **React**: Core framework for building the user interface.
- **Chart.js**: Library for interactive data visualization.
- **MidiWriterJS**: Library for generating MIDI files.

## Project Structure

- `src/components/BpmTracker.js`: Main component handling the BPM tracking logic, chart rendering, and MIDI export.
- `public`: Static assets (e.g., index.html).
- `package.json`: Project configuration and dependencies.

## Keyboard Shortcuts

- `Space`: Tap to record beats.
- `R` or `Escape`: Reset the app.

## Deployment

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to your preferred hosting service (e.g., Netlify, Vercel, or GitHub Pages).

## Known Issues

- Rapid tapping may cause inaccuracies in BPM calculations due to hardware or browser limitations.

## Author

Developed by Jeremy Giddings(https://github.com/acidjez).
