# Color Clustering Feature

## Overview
This feature allows multiple colors to be submitted at the same location and displays them with small offsets on the map to prevent overlapping.

## How it works

### 1. Color Submission
- Users can submit multiple colors at the same location without any restrictions
- The form includes a helpful note: "💡 Multiple colors can be submitted at the same location. They will be displayed with small offsets on the map."

### 2. Automatic Clustering
- When colors are within 0.01 degrees of each other (approximately 1km), they are automatically clustered
- Each clustered marker is displayed with a small offset using a spiral pattern distribution
- The offset ensures all markers remain visible and clickable

### 3. Visual Indicators
- Clustered markers show a small badge with the number of colors at that location
- The badge appears in the top-right corner of the marker
- Hovering over a clustered marker shows a tooltip: "X colors at this location"

### 4. Technical Implementation
- Uses a distance-based clustering algorithm in `src/lib/map.ts`
- Clustering is applied in real-time when the map renders
- Offsets are calculated using a spiral pattern for optimal distribution
- The clustering threshold can be adjusted in the `clusterMarkers` function

## Benefits
- Allows multiple colors from the same location (e.g., different pigments from the same area)
- Prevents marker overlap on the map
- Maintains visual clarity and usability
- Provides clear indication when multiple colors exist at the same location

## Files Modified
- `src/lib/map.ts` - Added clustering utility functions
- `src/components/Map.tsx` - Updated to use clustering for color markers
- `src/components/ColorSubmissionForm.tsx` - Added helpful note about multiple colors

## Usage
Users can now:
1. Submit colors at the same location without errors
2. See all colors from a location displayed with small offsets
3. Identify locations with multiple colors via the cluster indicator
4. Click on any marker to view the color details 