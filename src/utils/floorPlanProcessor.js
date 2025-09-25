/**
 * Floor Plan Data Processor
 *
 * This utility ensures that API responses are properly formatted and validated
 * before being passed to the FloorPlanViewer component.
 */

/**
 * Validates and processes floor plan data from the API
 * @param {Object} apiResponse - Raw response from the AI search API
 * @returns {Object} - Processed and validated floor plan data
 */
export const processFloorPlanData = (apiResponse) => {
  console.log('🔄 Processing floor plan data:', apiResponse);

  // Validate input
  if (!apiResponse?.analysis?.floorPlan) {
    console.warn('⚠️ No floor plan data in API response');
    return null;
  }

  const floorPlan = apiResponse.analysis.floorPlan;

  try {
    // Process and validate rooms
    const processedRooms = processRooms(floorPlan.rooms || []);

    // Process and validate walls
    const processedWalls = processWalls(floorPlan.walls || []);

    // Process doors and windows
    const processedDoors = processDoors(floorPlan.doors || []);
    const processedWindows = processWindows(floorPlan.windows || []);

    // Process furniture
    const processedFurniture = processFurniture(floorPlan.furniture || []);

    // Calculate proper bounds for the entire floor plan
    const bounds = calculateOptimalBounds(processedRooms, processedWalls);

    const processedFloorPlan = {
      rooms: processedRooms,
      walls: processedWalls,
      doors: processedDoors,
      windows: processedWindows,
      furniture: processedFurniture,
      bounds,
      scale: floorPlan.scale || '1:100',
      totalArea: apiResponse.analysis.projectInfo?.totalArea || 'Custom Size'
    };

    console.log('✅ Floor plan processing completed:', {
      rooms: processedRooms.length,
      walls: processedWalls.length,
      doors: processedDoors.length,
      windows: processedWindows.length,
      furniture: processedFurniture.length,
      bounds
    });

    return processedFloorPlan;

  } catch (error) {
    console.error('❌ Error processing floor plan data:', error);
    return null;
  }
};

/**
 * Process and validate room data
 */
const processRooms = (rooms) => {
  if (!Array.isArray(rooms)) return [];

  return rooms.map((room, index) => {
    // Ensure all required properties exist
    const processedRoom = {
      id: room.id || `room_${index}`,
      name: room.name || `Room ${index + 1}`,
      type: room.type || 'room',
      dimensions: validateDimensions(room.dimensions),
      color: room.color || getDefaultRoomColor(index),
      features: Array.isArray(room.features) ? room.features : []
    };

    return processedRoom;
  }).filter(room => room.dimensions !== null); // Remove rooms with invalid dimensions
};

/**
 * Process and validate wall data
 */
const processWalls = (walls) => {
  if (!Array.isArray(walls)) return [];

  return walls.map((wall, index) => ({
    id: wall.id || `wall_${index}`,
    start: validatePoint(wall.start) || { x: 0, y: 0 },
    end: validatePoint(wall.end) || { x: 100, y: 0 },
    thickness: Math.max(1, wall.thickness || 4),
    type: wall.type || 'interior'
  })).filter(wall =>
    wall.start && wall.end &&
    (wall.start.x !== wall.end.x || wall.start.y !== wall.end.y)
  );
};

/**
 * Process doors
 */
const processDoors = (doors) => {
  if (!Array.isArray(doors)) return [];

  return doors.map((door, index) => ({
    id: door.id || `door_${index}`,
    position: validatePoint(door.position) || { x: 0, y: 0 },
    width: Math.max(10, door.width || 30),
    rotation: door.rotation || 0,
    type: door.type || 'interior',
    connects: Array.isArray(door.connects) ? door.connects : []
  })).filter(door => door.position !== null);
};

/**
 * Process windows
 */
const processWindows = (windows) => {
  if (!Array.isArray(windows)) return [];

  return windows.map((window, index) => ({
    id: window.id || `window_${index}`,
    position: validatePoint(window.position) || { x: 0, y: 0 },
    width: Math.max(10, window.width || 40),
    height: Math.max(5, window.height || 20),
    wallId: window.wallId || null
  })).filter(window => window.position !== null);
};

/**
 * Process furniture
 */
const processFurniture = (furniture) => {
  if (!Array.isArray(furniture)) return [];

  return furniture.map((item, index) => ({
    id: item.id || `furniture_${index}`,
    type: item.type || 'furniture',
    position: validatePoint(item.position) || { x: 0, y: 0 },
    dimensions: validateDimensions(item.dimensions) || { x: 0, y: 0, width: 10, height: 10 },
    rotation: item.rotation || 0,
    roomId: item.roomId || null,
    color: item.color || '#6b7280'
  })).filter(item => item.position && item.dimensions);
};

/**
 * Validate dimension object
 */
const validateDimensions = (dimensions) => {
  if (!dimensions || typeof dimensions !== 'object') return null;

  const x = parseFloat(dimensions.x);
  const y = parseFloat(dimensions.y);
  const width = parseFloat(dimensions.width);
  const height = parseFloat(dimensions.height);

  // Check if all values are valid numbers
  if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
    return null;
  }

  // Ensure positive dimensions
  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
};

/**
 * Validate point object
 */
const validatePoint = (point) => {
  if (!point || typeof point !== 'object') return null;

  const x = parseFloat(point.x);
  const y = parseFloat(point.y);

  if (!isFinite(x) || !isFinite(y)) return null;

  return { x, y };
};

/**
 * Calculate optimal bounds for the floor plan
 */
const calculateOptimalBounds = (rooms, walls) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasValidElements = false;

  // Include room bounds
  rooms.forEach(room => {
    if (room.dimensions) {
      const { x, y, width, height } = room.dimensions;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
      hasValidElements = true;
    }
  });

  // Include wall bounds
  walls.forEach(wall => {
    if (wall.start && wall.end) {
      minX = Math.min(minX, wall.start.x, wall.end.x);
      minY = Math.min(minY, wall.start.y, wall.end.y);
      maxX = Math.max(maxX, wall.start.x, wall.end.x);
      maxY = Math.max(maxY, wall.start.y, wall.end.y);
      hasValidElements = true;
    }
  });

  // Default bounds if no valid elements
  if (!hasValidElements || minX === Infinity) {
    return { minX: 0, minY: 0, width: 100, height: 100 };
  }

  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 10),
    height: Math.max(maxY - minY, 10)
  };
};

/**
 * Get default color for room based on index
 */
const getDefaultRoomColor = (index) => {
  const colors = [
    '#f8f9fa', '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0',
    '#fce4ec', '#e1f5fe', '#f1f8e9', '#fef7e0', '#e8eaf6'
  ];
  return colors[index % colors.length];
};

/**
 * Validate entire floor plan structure
 */
export const validateFloorPlan = (floorPlan) => {
  if (!floorPlan || typeof floorPlan !== 'object') {
    return { valid: false, errors: ['Floor plan is not an object'] };
  }

  const errors = [];

  // Check for required arrays
  if (!Array.isArray(floorPlan.rooms)) errors.push('Rooms array is missing or invalid');
  if (!Array.isArray(floorPlan.walls)) errors.push('Walls array is missing or invalid');

  // Check if there's at least some content
  const hasRooms = floorPlan.rooms && floorPlan.rooms.length > 0;
  const hasWalls = floorPlan.walls && floorPlan.walls.length > 0;

  if (!hasRooms && !hasWalls) {
    errors.push('Floor plan has no rooms or walls to display');
  }

  return {
    valid: errors.length === 0,
    errors,
    hasRooms,
    hasWalls
  };
};

export default processFloorPlanData;