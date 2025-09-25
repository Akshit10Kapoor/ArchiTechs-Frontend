import React, { useRef, useEffect, useState } from 'react';

const FloorPlanViewerV2 = ({ floorPlan, style = {}, className = "" }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!floorPlan || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Debug: Log the processed floor plan data
    console.log('🎨 FloorPlanViewerV2 rendering:', {
      hasRooms: !!floorPlan.rooms?.length,
      hasWalls: !!floorPlan.walls?.length,
      hasDoors: !!floorPlan.doors?.length,
      hasWindows: !!floorPlan.windows?.length,
      hasFurniture: !!floorPlan.furniture?.length,
      bounds: floorPlan.bounds
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Use processed bounds from the data processor
    const bounds = floorPlan.bounds || { minX: 0, minY: 0, width: 100, height: 100 };

    // Calculate scale to fit the canvas with some padding
    const padding = 50;
    const scale = Math.min(
      (canvas.width - padding * 2) / bounds.width,
      (canvas.height - padding * 2) / bounds.height
    );

    // Center the floor plan
    const offsetX = (canvas.width - bounds.width * scale) / 2 - bounds.minX * scale;
    const offsetY = (canvas.height - bounds.height * scale) / 2 - bounds.minY * scale;

    console.log('🔢 Rendering parameters:', {
      bounds,
      scale: scale.toFixed(2),
      offset: { x: offsetX.toFixed(2), y: offsetY.toFixed(2) },
      canvas: { width: canvas.width, height: canvas.height }
    });

    // Apply transform
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    try {
      // Validate scale
      if (!isFinite(scale) || scale <= 0) {
        throw new Error(`Invalid scale: ${scale}`);
      }

      // Draw floor plan elements in professional order
      drawRooms(ctx, floorPlan.rooms || []);
      drawWalls(ctx, floorPlan.walls || []);
      drawHouseOutline(ctx, floorPlan.rooms || []);
      drawDoors(ctx, floorPlan.doors || []);
      drawWindows(ctx, floorPlan.windows || []);
      drawFurniture(ctx, floorPlan.furniture || []);
      drawRoomLabels(ctx, floorPlan.rooms || []);
      // Removed messy circulation lines

      console.log('✅ Floor plan rendered successfully');
    } catch (error) {
      console.error('❌ Error rendering floor plan:', error);
      // Draw error message
      ctx.restore();
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Error rendering floor plan', canvas.width / 2, canvas.height / 2);
      ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 20);
      return;
    }

    ctx.restore();

  }, [floorPlan, dimensions]);

  // Draw rooms with proper coordinates and special handling for all space types
  const drawRooms = (ctx, rooms) => {
    rooms.forEach((room, index) => {
      if (!room.dimensions) return;

      const { x, y, width, height } = room.dimensions;

      // Detect room types dynamically
      const roomType = room.type?.toLowerCase() || '';
      const roomName = room.name?.toLowerCase() || '';

      const isHallway = roomType.includes('hallway') || roomType.includes('foyer') || roomType.includes('corridor');
      const isBalcony = roomType.includes('balcony') || roomType.includes('terrace');
      const isPool = roomType.includes('pool') || roomType.includes('swimming') || roomName.includes('pool');
      const isGarden = roomType.includes('garden') || roomType.includes('outdoor') || roomName.includes('garden');
      const isDeck = roomType.includes('deck') || roomType.includes('patio') || roomName.includes('deck');
      const isKitchen = roomType.includes('kitchen') || roomName.includes('kitchen');
      const isBathroom = roomType.includes('bathroom') || roomType.includes('bath') || roomName.includes('bath');
      const isBedroom = roomType.includes('bedroom') || roomType.includes('bed') || roomName.includes('bedroom');

      // Dynamic coloring for different room types
      let roomColor = room.color;
      let strokeColor = '#888888';
      let strokeWidth = 0.3;
      let isSpecialSpace = false;

      if (isHallway) {
        roomColor = '#f8f8f8'; // Light gray for hallways
      } else if (isBalcony || isDeck) {
        roomColor = '#e8f5e8'; // Light green for balconies/decks
        strokeColor = '#4CAF50';
        strokeWidth = 0.8;
        isSpecialSpace = true;
      } else if (isPool) {
        roomColor = '#e3f2fd'; // Light blue for pools
        strokeColor = '#2196F3';
        strokeWidth = 1.0;
        isSpecialSpace = true;
      } else if (isGarden) {
        roomColor = '#f1f8e9'; // Light green for gardens
        strokeColor = '#8BC34A';
        strokeWidth = 0.8;
        isSpecialSpace = true;
      } else if (isKitchen) {
        roomColor = '#fff3e0'; // Light orange for kitchens
      } else if (isBathroom) {
        roomColor = '#f3e5f5'; // Light purple for bathrooms
      } else if (isBedroom) {
        roomColor = '#fce4ec'; // Light pink for bedrooms
      }

      // Fill room with color
      ctx.fillStyle = roomColor;
      ctx.fillRect(x, y, width, height);

      // Special patterns for different spaces
      if (isHallway) {
        // Add subtle pattern for hallways
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.fillRect(x, y, width, height);
      } else if (isPool) {
        // Add water effect for pools
        ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
        ctx.fillRect(x, y, width, height);

        // Add water ripple pattern
        ctx.strokeStyle = '#64B5F6';
        ctx.lineWidth = 0.2;
        for (let i = 0; i < 3; i++) {
          const rippleX = x + width * (0.25 + i * 0.25);
          const rippleY = y + height * 0.5;
          ctx.beginPath();
          ctx.arc(rippleX, rippleY, width * 0.1 * (1 + i * 0.3), 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (isGarden) {
        // Add plant/grass pattern for gardens
        ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
        ctx.fillRect(x, y, width, height);

        // Add simple plant symbols
        ctx.fillStyle = '#4CAF50';
        const plantSize = Math.min(width, height) * 0.1;
        for (let px = x + plantSize; px < x + width - plantSize; px += plantSize * 2) {
          for (let py = y + plantSize; py < y + height - plantSize; py += plantSize * 2) {
            ctx.beginPath();
            ctx.arc(px, py, plantSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Room border - varies by room type
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(x, y, width, height);

      // Add special border patterns for outdoor/special spaces
      if (isSpecialSpace) {
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]); // Reset
      }
    });
  };

  // Draw walls using professional architectural standards - thinner lines
  const drawWalls = (ctx, walls) => {
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 0.5;
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

  // Draw house outline to enclose everything
  const drawHouseOutline = (ctx, rooms) => {
    if (!rooms || rooms.length === 0) return;

    // Calculate overall house bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    rooms.forEach(room => {
      if (room.dimensions) {
        const { x, y, width, height } = room.dimensions;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      }
    });

    if (minX === Infinity) return;

    // Add padding around the house
    const padding = 1;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Draw house outline with thinner lines
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

    // Add subtle shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(minX + 0.5, minY + 0.5, maxX - minX, maxY - minY);
  };

  // Draw doors using professional architectural standards
  const drawDoors = (ctx, doors) => {
    console.log('Drawing doors:', doors.length);

    doors.forEach((door, index) => {
      if (!door.position) {
        console.log(`Door ${index} missing position:`, door);
        return;
      }

      const { x, y } = door.position;
      const width = door.width || 3;
      const rotation = (door.rotation || 0) * Math.PI / 180;

      console.log(`Drawing door ${index + 1} at (${x}, ${y}) with width ${width}, rotation ${rotation * 180 / Math.PI}°`);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Professional door representation - gap in wall + swing arc

      // 1. Create door opening (white gap in wall)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-width/2, -0.3, width, 0.6);

      // 2. Draw door swing arc (standard architectural symbol)
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 0.1;
      ctx.beginPath();
      ctx.arc(width/2, 0, width/2, Math.PI, Math.PI * 1.5);
      ctx.stroke();

      // 3. Draw door panel line
      ctx.beginPath();
      ctx.moveTo(width/2, 0);
      ctx.lineTo(width/2 + (width/2) * Math.cos(Math.PI * 1.25), (width/2) * Math.sin(Math.PI * 1.25));
      ctx.stroke();

      ctx.restore();
    });
  };

  // Draw connections between rooms
  const drawConnections = (ctx, rooms, doors) => {
    // Draw subtle lines showing circulation paths
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 0.2;
    ctx.setLineDash([1, 1]);

    // Find hallways and foyers
    const circulationSpaces = rooms.filter(room =>
      room.type === 'hallway' || room.type === 'foyer'
    );

    circulationSpaces.forEach(hallway => {
      if (!hallway.dimensions) return;

      const hallCenter = {
        x: hallway.dimensions.x + hallway.dimensions.width / 2,
        y: hallway.dimensions.y + hallway.dimensions.height / 2
      };

      // Connect to nearby rooms
      rooms.forEach(room => {
        if (room === hallway || !room.dimensions) return;
        if (room.type === 'hallway' || room.type === 'foyer') return;

        const roomCenter = {
          x: room.dimensions.x + room.dimensions.width / 2,
          y: room.dimensions.y + room.dimensions.height / 2
        };

        // Check if rooms are adjacent (within reasonable distance)
        const distance = Math.sqrt(
          Math.pow(hallCenter.x - roomCenter.x, 2) +
          Math.pow(hallCenter.y - roomCenter.y, 2)
        );

        if (distance < 20) { // Adjust threshold as needed
          ctx.beginPath();
          ctx.moveTo(hallCenter.x, hallCenter.y);
          ctx.lineTo(roomCenter.x, roomCenter.y);
          ctx.stroke();
        }
      });
    });

    ctx.setLineDash([]); // Reset dash pattern
  };

  // Draw windows
  const drawWindows = (ctx, windows) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 0.6;

    windows.forEach(window => {
      if (!window.position) return;

      const { x, y } = window.position;
      const width = window.width || 4;

      // Main window line
      ctx.beginPath();
      ctx.moveTo(x - width/2, y);
      ctx.lineTo(x + width/2, y);
      ctx.stroke();

      // Window sill
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(x - width/2, y - 0.2);
      ctx.lineTo(x + width/2, y - 0.2);
      ctx.stroke();

      // Reset to main color
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 0.6;
    });
  };

  // Draw furniture
  const drawFurniture = (ctx, furniture) => {
    furniture.forEach(item => {
      if (!item.position || !item.dimensions) return;

      const { x, y } = item.position;
      const { width, height } = item.dimensions;
      const rotation = (item.rotation || 0) * Math.PI / 180;

      ctx.save();
      ctx.translate(x + width/2, y + height/2);
      ctx.rotate(rotation);

      // Draw furniture
      ctx.fillStyle = item.color || '#6b7280';
      ctx.fillRect(-width/2, -height/2, width, height);

      // Furniture border
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 0.2;
      ctx.strokeRect(-width/2, -height/2, width, height);

      ctx.restore();
    });
  };

  // Draw room labels
  const drawRoomLabels = (ctx, rooms) => {
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    rooms.forEach(room => {
      if (!room.dimensions || !room.name) return;

      const { x, y, width, height } = room.dimensions;
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      // Calculate font size based on room size and scale
      const fontSize = Math.max(0.8, Math.min(1.5, Math.min(width, height) / 8));
      ctx.font = `${fontSize}px Arial`;

      // Room name
      ctx.fillText(room.name, centerX, centerY - fontSize/2);

      // Room type (smaller)
      if (room.type && room.type !== room.name.toLowerCase()) {
        ctx.font = `${fontSize * 0.7}px Arial`;
        ctx.fillStyle = '#6b7280';
        ctx.fillText(room.type, centerX, centerY + fontSize/2);
        ctx.fillStyle = '#374151';
      }
    });
  };

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        const rect = parent.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver if available for more precise resize detection
    if (window.ResizeObserver && canvasRef.current) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvasRef.current.parentElement);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validation - show appropriate messages
  if (!floorPlan) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🏗️</div>
          <p>No floor plan data available</p>
        </div>
      </div>
    );
  }

  // Check if floor plan has valid renderable data
  const hasRooms = floorPlan.rooms?.length > 0;
  const hasWalls = floorPlan.walls?.length > 0;

  if (!hasRooms && !hasWalls) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Floor plan data is incomplete</p>
          <p className="text-xs mt-1">Missing room or wall information</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          imageRendering: 'crisp-edges',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default FloorPlanViewerV2;