import React, { useRef, useEffect, useState } from 'react';

const FloorPlanViewer = ({ floorPlan, style = {}, className = "" }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!floorPlan || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Debug: Log the floor plan data being rendered
    console.log('🎨 FloorPlanViewer rendering:', {
      rooms: floorPlan.rooms?.length || 0,
      walls: floorPlan.walls?.length || 0,
      doors: floorPlan.doors?.length || 0,
      windows: floorPlan.windows?.length || 0,
      furniture: floorPlan.furniture?.length || 0
    });

    if (floorPlan.rooms?.length > 0) {
      console.log('🏠 Original Room coordinates:');
      floorPlan.rooms.forEach((room, index) => {
        console.log(`  Room ${index + 1}: ${room.name}`, room.dimensions);
      });

      // Show adjusted coordinates
      const adjustedRooms = adjustOverlappingRooms(floorPlan.rooms);
      console.log('🔧 Adjusted Room coordinates:');
      adjustedRooms.forEach((room, index) => {
        console.log(`  Room ${index + 1}: ${room.name}`, room.dimensions);
      });
    }

    if (floorPlan.walls?.length > 0) {
      console.log('🧱 Wall coordinates:');
      floorPlan.walls.forEach((wall, index) => {
        console.log(`  Wall ${index + 1}:`, wall);
      });
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Calculate scale based on floor plan bounds
    const bounds = calculateFloorPlanBounds(floorPlan);
    console.log('📏 Calculated bounds:', bounds);

    const scale = Math.min(
      (canvas.width - 100) / bounds.width,
      (canvas.height - 100) / bounds.height
    );

    console.log('🔢 Rendering scale:', scale, 'Canvas:', {width: canvas.width, height: canvas.height});

    // Center the floor plan
    const offsetX = (canvas.width - bounds.width * scale) / 2 - bounds.minX * scale;
    const offsetY = (canvas.height - bounds.height * scale) / 2 - bounds.minY * scale;

    // Apply transform
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    try {
      // Validate scale before drawing
      if (!isFinite(scale) || scale <= 0) {
        console.error('❌ Invalid scale calculated:', scale, 'bounds:', bounds);
        ctx.restore();
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Invalid floor plan dimensions', canvas.width / 2, canvas.height / 2);
        return;
      }

      // Draw floor plan elements
      console.log('🖌️ Drawing floor plan elements...');
      drawRooms(ctx, floorPlan.rooms || []);
      drawWalls(ctx, floorPlan.walls || []);
      drawDoors(ctx, floorPlan.doors || []);
      drawWindows(ctx, floorPlan.windows || []);
      drawFurniture(ctx, floorPlan.furniture || []);
      drawLabels(ctx, floorPlan.rooms || []);
      console.log('✅ Floor plan rendering completed');
    } catch (error) {
      console.error('❌ Error drawing floor plan:', error);
      // Draw error message
      ctx.restore();
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Error rendering floor plan', canvas.width / 2, canvas.height / 2);
      return;
    }

    ctx.restore();

  }, [floorPlan, dimensions]);

  // Adjust overlapping rooms to create a non-overlapping layout
  const adjustOverlappingRooms = (rooms) => {
    if (!rooms || rooms.length === 0) return [];

    const adjusted = [];
    let currentX = 0;
    let currentY = 0;
    let maxRowHeight = 0;
    const margin = 2; // Space between rooms
    const maxWidth = 30; // Max width before wrapping to new row

    rooms.forEach((room, index) => {
      if (!room.dimensions) return;

      const { width, height } = room.dimensions;

      // If this room would exceed max width, move to next row
      if (currentX > 0 && currentX + width > maxWidth) {
        currentX = 0;
        currentY += maxRowHeight + margin;
        maxRowHeight = 0;
      }

      // Create adjusted room
      const adjustedRoom = {
        ...room,
        dimensions: {
          ...room.dimensions,
          x: currentX,
          y: currentY
        }
      };

      adjusted.push(adjustedRoom);

      // Update position for next room
      currentX += width + margin;
      maxRowHeight = Math.max(maxRowHeight, height);
    });

    return adjusted;
  };

  // Calculate the bounding box of the entire floor plan
  const calculateFloorPlanBounds = (floorPlan) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let foundElements = 0;

    // Check rooms (use adjusted positions to avoid overlapping)
    if (floorPlan.rooms && floorPlan.rooms.length > 0) {
      const adjustedRooms = adjustOverlappingRooms(floorPlan.rooms);
      adjustedRooms.forEach(room => {
        if (room.dimensions && typeof room.dimensions.x === 'number') {
          minX = Math.min(minX, room.dimensions.x);
          minY = Math.min(minY, room.dimensions.y);
          maxX = Math.max(maxX, room.dimensions.x + room.dimensions.width);
          maxY = Math.max(maxY, room.dimensions.y + room.dimensions.height);
          foundElements++;
        }
      });
    }

    // Check walls
    if (floorPlan.walls && floorPlan.walls.length > 0) {
      floorPlan.walls.forEach(wall => {
        if (wall.start && wall.end && typeof wall.start.x === 'number') {
          minX = Math.min(minX, wall.start.x, wall.end.x);
          minY = Math.min(minY, wall.start.y, wall.end.y);
          maxX = Math.max(maxX, wall.start.x, wall.end.x);
          maxY = Math.max(maxY, wall.start.y, wall.end.y);
          foundElements++;
        }
      });
    }

    // Default bounds if nothing found
    if (minX === Infinity || foundElements === 0) {
      console.warn('⚠️ No valid coordinates found, using default bounds');
      return { minX: 0, minY: 0, width: 100, height: 100 };
    }

    const bounds = {
      minX,
      minY,
      width: Math.max(maxX - minX, 10), // Minimum width of 10
      height: Math.max(maxY - minY, 10) // Minimum height of 10
    };

    console.log('📐 Bounds calculation:', {
      foundElements,
      bounds,
      roomCount: floorPlan.rooms?.length || 0,
      wallCount: floorPlan.walls?.length || 0
    });

    return bounds;
  };

  // Draw walls
  const drawWalls = (ctx, walls) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.lineCap = 'square';

    walls.forEach(wall => {
      if (wall.start && wall.end) {
        ctx.beginPath();
        ctx.moveTo(wall.start.x, wall.start.y);
        ctx.lineTo(wall.end.x, wall.end.y);
        ctx.stroke();
      }
    });
  };

  // Draw rooms
  const drawRooms = (ctx, rooms) => {
    // Check for overlapping rooms and fix layout if needed
    const adjustedRooms = adjustOverlappingRooms(rooms);

    adjustedRooms.forEach((room, index) => {
      if (!room.dimensions) return;

      const { x, y, width, height } = room.dimensions;

      // Generate different colors for each room
      const colors = [
        '#f8f9fa', '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0',
        '#fce4ec', '#e1f5fe', '#f1f8e9', '#fef7e0', '#e8eaf6'
      ];
      const roomColor = room.color || colors[index % colors.length];

      // Fill room
      ctx.fillStyle = roomColor;
      ctx.fillRect(x, y, width, height);

      // Room border
      ctx.strokeStyle = index === 0 ? '#333' : '#666'; // Darker border for first room
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    });
  };

  // Draw doors
  const drawDoors = (ctx, doors) => {
    ctx.strokeStyle = '#8b5cf6';
    ctx.fillStyle = '#8b5cf6';
    ctx.lineWidth = 2;

    doors.forEach(door => {
      if (!door.position) return;

      const { x, y } = door.position;
      const width = door.width || 30;
      const rotation = door.rotation || 0;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw door
      ctx.beginPath();
      ctx.rect(-width/2, -2, width, 4);
      ctx.fill();

      // Draw door swing arc
      ctx.beginPath();
      ctx.arc(0, 0, width/2, 0, Math.PI/2);
      ctx.stroke();

      ctx.restore();
    });
  };

  // Draw windows
  const drawWindows = (ctx, windows) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;

    windows.forEach(window => {
      if (!window.position) return;

      const { x, y } = window.position;
      const width = window.width || 40;

      ctx.beginPath();
      ctx.moveTo(x - width/2, y);
      ctx.lineTo(x + width/2, y);
      ctx.stroke();

      // Window sill
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - width/2, y - 2);
      ctx.lineTo(x + width/2, y - 2);
      ctx.stroke();

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
    });
  };

  // Draw furniture
  const drawFurniture = (ctx, furniture) => {
    furniture.forEach(item => {
      if (!item.position || !item.dimensions) return;

      const { x, y } = item.position;
      const { width, height } = item.dimensions;
      const rotation = item.rotation || 0;

      ctx.save();
      ctx.translate(x + width/2, y + height/2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw furniture
      ctx.fillStyle = item.color || '#6b7280';
      ctx.fillRect(-width/2, -height/2, width, height);

      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      ctx.strokeRect(-width/2, -height/2, width, height);

      ctx.restore();
    });
  };

  // Draw room labels
  const drawLabels = (ctx, rooms) => {
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    rooms.forEach(room => {
      if (!room.dimensions || !room.name) return;

      const { x, y, width, height } = room.dimensions;
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      // Room name
      ctx.fillText(room.name, centerX, centerY - 5);

      // Room area (if available)
      if (width && height) {
        const area = Math.round((width * height) / 144); // Convert to sq ft approximately
        ctx.font = '10px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`${area} sq ft`, centerX, centerY + 8);
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
      }
    });
  };

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!floorPlan) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🏗️</div>
          <p>No floor plan data available</p>
          <p className="text-xs mt-1">Generate a new design to see floor plan</p>
        </div>
      </div>
    );
  }

  // Check if floor plan has valid data
  const hasValidData = floorPlan.rooms?.length > 0 || floorPlan.walls?.length > 0;
  if (!hasValidData) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🏗️</div>
          <p>Floor plan is being generated...</p>
          <p className="text-xs mt-1">AI is creating your custom layout</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
};

export default FloorPlanViewer;