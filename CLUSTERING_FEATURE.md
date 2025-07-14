# Color Clustering Feature

## Overview
This feature allows multiple colors to be submitted at the same location and displays them with intelligent offsets on the map that scale with zoom level, creating a clear visual indication of overlapping colors.

## How it works

### 1. Color Submission
- Users can submit multiple colors at the same location without any restrictions
- The form includes a helpful note: "💡 Multiple colors can be submitted at the same location. They will be displayed with small offsets on the map."

### 2. Intelligent Clustering
- When colors are within 0.01 degrees of each other (approximately 1km), they are automatically clustered
- Each clustered marker is displayed with a calculated offset using optimized distribution patterns
- The offset ensures all markers remain visible and clickable at all zoom levels

### 3. Zoom-Based Scaling
- **Low Zoom (Zoomed Out)**: Markers are spread further apart to clearly show multiple colors exist
- **High Zoom (Zoomed In)**: Markers are closer together for precise location viewing
- This creates an intuitive visual illusion that adapts to the user's viewing context

### 4. Distribution Patterns
- **2 Colors**: Simple left-right offset for clear separation
- **3 Colors**: Triangle pattern for balanced distribution
- **4 Colors**: Square pattern for optimal spacing
- **5+ Colors**: Spiral pattern with increasing radius for larger clusters

### 5. Visual Indicators
- All markers remain individually clickable and visible
- No numerical badges or overlays - pure visual displacement
- Hover effects and interactions work normally for each marker
- Smooth transitions as users zoom in and out

### 6. Technical Implementation
- Uses a distance-based clustering algorithm in `src/lib/map.ts`
- Clustering is applied in real-time when the map renders
- Zoom-based scaling is calculated using `applyZoomScaling()` function
- Base offsets are stored and scaled dynamically based on viewport zoom level

## Benefits
- **Clear Visual Communication**: Users immediately understand when multiple colors exist at a location
- **Adaptive Display**: Markers adjust their separation based on zoom level for optimal viewing
- **No Information Loss**: All colors remain accessible and clickable
- **Intuitive UX**: Natural visual progression from overview to detail
- **Performance Optimized**: Efficient clustering algorithm with minimal computational overhead

## Files Modified
- `src/lib/map.ts` - Enhanced clustering utility functions with zoom scaling
- `src/components/Map.tsx` - Updated to use zoom-based clustering
- `src/components/ColorSubmissionForm.tsx` - Added helpful note about multiple colors

## Usage
Users can now:
1. Submit colors at the same location without errors
2. See all colors from a location displayed with intelligent offsets
3. Experience adaptive marker separation based on zoom level
4. Click on any marker to view the color details
5. Navigate smoothly between overview and detailed views

## Technical Details
- **Clustering Threshold**: 0.01 degrees (approximately 1km)
- **Zoom Scaling Factor**: 0.3x to 2.0x based on zoom level
- **Base Offset Range**: 0.0007 to 0.0009 degrees for optimal visibility
- **Performance**: O(n²) clustering algorithm with memoization for efficiency 