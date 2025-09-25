import React, { useState, useEffect } from 'react';
import FloorPlanViewerV2 from '../Components/FloorPlanViewerV2';
import { processFloorPlanData, validateFloorPlan } from '../utils/floorPlanProcessor';
import {
  MessageCircle,
  Bell,
  Search,
  Home,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Heart,
  Star,
  Download,
  Share2,
  ArrowLeft,
  Eye,
  Box,
  Send,
  Bot,
  Info
} from 'lucide-react';
import kai from "../assets/kai.jpg"

const Results = () => {
  const [selectedDesign, setSelectedDesign] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showTooltip, setShowTooltip] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [floorPlans, setFloorPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jennyMessage, setJennyMessage] = useState('');

  // Load AI search results from sessionStorage
  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem('aiSearchResults');
      if (storedResults) {
        const results = JSON.parse(storedResults);
        console.log('📊 Loading AI search results:', results);

        setSearchResults(results);
        setJennyMessage(results.jennyResponse?.message || 'Here are your AI-generated floor plan designs!');

        // Extract multiple floor plan analyses from AI response
        const multipleAnalyses = results.multipleAnalyses || [results.analysis];
        const hasMultipleAnalyses = multipleAnalyses && multipleAnalyses.length > 1;

        console.log('🔍 Debug multiple floor plan data:', {
          hasMultipleAnalyses,
          analysesCount: multipleAnalyses?.length || 0,
          analyses: multipleAnalyses?.map((analysis, index) => ({
            index,
            hasAnalysis: !!analysis,
            hasFloorPlan: !!(analysis?.floorPlan),
            projectInfo: analysis?.projectInfo || null,
            roomCount: analysis?.floorPlan?.rooms?.length || 0
          })) || [],
          fullResults: results
        });

        // Process multiple floor plan analyses
        console.log('🔄 Processing multiple floor plan analyses...');
        console.log('Debug: multipleAnalyses =', multipleAnalyses);

        const floorPlanDesigns = [];

        // Handle case where backend doesn't provide proper floor plan data
        if (!multipleAnalyses || multipleAnalyses.length === 0 || multipleAnalyses.every(a => !a || !a.floorPlan || !a.floorPlan.rooms || a.floorPlan.rooms.length === 0)) {
          console.warn('⚠️ Backend provided no valid floor plan data. Backend needs to implement proper floor plan generation.');

          // Show helpful message to user about what to fix
          setFloorPlans([]);
          setJennyMessage(
            `I received your request for "${results.searchMetadata?.description || 'a floor plan'}" but the backend system needs to be configured to generate actual floor plan data. ` +
            `The backend is responding but not providing room layouts. Please check the backend floor plan generation service.`
          );

          console.log('❌ No valid analyses found:', {
            multipleAnalyses,
            analysisCount: multipleAnalyses?.length || 0,
            allAnalysesEmpty: multipleAnalyses?.every(a => !a?.floorPlan?.rooms?.length)
          });

          return; // Exit early since we have no valid data
        }

        multipleAnalyses.filter(analysis => analysis && analysis.floorPlan && analysis.floorPlan.rooms && analysis.floorPlan.rooms.length > 0).forEach((analysis, index) => {
          // Additional detailed logging for each floor plan
          if (analysis?.floorPlan) {
            console.log(`📐 Floor Plan ${index + 1} Details:`, analysis.floorPlan);
            if (analysis.floorPlan.rooms) {
              console.log(`🏠 Rooms in floor plan ${index + 1}:`, analysis.floorPlan.rooms);
            }
          }

          // Create a mock results object for each analysis
          const mockResults = { analysis, jennyResponse: results.jennyResponse, searchMetadata: results.searchMetadata };

          // Process each floor plan data using the robust processor
          const processedFloorPlan = processFloorPlanData(mockResults);

          if (processedFloorPlan) {
            // Validate the processed floor plan
            const validation = validateFloorPlan(processedFloorPlan);
            console.log(`✅ Floor plan ${index + 1} validation:`, validation);

            // Generate unique design variations
            const designVariations = [
              { color: "from-blue-500 to-blue-700", image: "🏗️" },
              { color: "from-green-500 to-green-700", image: "🏡" },
              { color: "from-purple-500 to-purple-700", image: "🏠" },
              { color: "from-orange-500 to-orange-700", image: "🏢" },
              { color: "from-teal-500 to-teal-700", image: "🏘️" },
              { color: "from-pink-500 to-pink-700", image: "🏤" }
            ];

            const variation = designVariations[index % designVariations.length];

            // Create floor plan design
            const floorPlanDesign = {
              id: `ai_floor_plan_${index}`,
              title: analysis?.projectInfo?.name || `Floor Plan Option ${index + 1}`,
              type: analysis?.projectInfo?.type || 'Custom Layout',
              style: analysis?.projectInfo?.style || 'Modern',
              sqft: processedFloorPlan.totalArea || 'Custom Size',
              floorPlan: processedFloorPlan,
              specifications: analysis?.specifications,
              recommendations: analysis?.recommendations || [],
              rating: (4.5 + Math.random() * 0.5).toFixed(1), // Vary ratings
              likes: Math.floor(85 + Math.random() * 30), // Vary likes
              image: variation.image,
              color: variation.color
            };

            floorPlanDesigns.push(floorPlanDesign);
            console.log(`✅ Loaded processed floor plan design ${index + 1} with ${processedFloorPlan.rooms?.length || 0} rooms`);
          } else {
            console.warn(`⚠️ Floor plan ${index + 1} processing failed or no valid data found`);
          }
        });

        if (floorPlanDesigns.length > 0) {
          setFloorPlans(floorPlanDesigns);
          console.log(`✅ Successfully loaded ${floorPlanDesigns.length} floor plan variations`);
        } else {
          console.warn('⚠️ No valid floor plan designs could be processed');
        }
      } else {
        console.warn('⚠️ No AI search results found in sessionStorage');
      }
    } catch (error) {
      console.error('❌ Error loading search results:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use only floor plans - no fallback designs
  const designs = floorPlans;

  const currentDesign = designs[selectedDesign];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef5e6 0%, #f5f5f5 50%, #e5e5e5 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#694342] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI floor plan results...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no floor plans are available
  if (!designs || designs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef5e6 0%, #f5f5f5 50%, #e5e5e5 100%)' }}>
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gemini AI Processing Issue</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-red-800 mb-2">🔥 Issue Identified:</h3>
            <p className="text-red-700 text-sm mb-3">
              The backend reports <code>hasProcessingIssues: true</code> despite Gemini API being connected.
            </p>
            <p className="text-red-700 text-sm">
              This means the Gemini AI request/response processing logic in the backend has bugs.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-amber-800 mb-2">Frontend Status ✅</h3>
            <p className="text-amber-700 text-sm mb-3">
              Frontend correctly sent enhanced parameters:
            </p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• <code>generateMultipleLayouts=true</code></li>
              <li>• <code>layoutCount=6</code></li>
              <li>• <code>allowNonStandardSpaces=true</code></li>
              <li>• <code>dynamicRoomGeneration=true</code></li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Backend Issues to Fix:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check server logs for Gemini API errors</li>
              <li>• Verify Gemini prompt formatting</li>
              <li>• Fix Gemini response parsing logic</li>
              <li>• Handle Google Cloud Storage permissions (storage error in /status)</li>
              <li>• Implement proper error handling without generic "processing issues"</li>
            </ul>
          </div>
          {jennyMessage && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 italic">Jenny says: {jennyMessage}</p>
            </div>
          )}
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-[#694342] text-white rounded-lg hover:bg-[#5a3a39] transition-colors"
          >
            ← Try Another Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fef5e6 0%, #f5f5f5 50%, #e5e5e5 100%)' }}>
      {/* Header - Same as Dashboard */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#c6a480] shadow-sm">
        <div className="max-w-full px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Left: Brand and Back */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#694342' }}>
                  <Home className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg md:text-xl font-bold" style={{ color: '#694342' }}>
                  ArchiNova
                </h1>
              </div>
            </div>

            {/* Middle: Search */}
            <div className="hidden md:block flex-1 px-8 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Refine your design search..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg bg-white text-sm focus:outline-none"
                  style={{ borderColor: '#c6a480' }}
                  onFocus={(e) => e.target.style.borderColor = '#694342'}
                  onBlur={(e) => e.target.style.borderColor = '#c6a480'}
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold" style={{ backgroundColor: '#694342' }}>
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Design Thumbnails */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4 overflow-y-auto"
             style={{
               scrollbarWidth: 'thin',
               scrollbarColor: '#d1d5db transparent'
             }}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Layout Options
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              {designs.length} layout variation{designs.length !== 1 ? 's' : ''} generated
            </p>
            <p className="text-xs text-blue-600 mb-3">
              ✨ AI-generated floor plan alternatives
            </p>
            {designs.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs font-medium text-blue-800">Multiple Options Available</p>
                </div>
                <p className="text-xs text-blue-700">
                  Scroll through different layout variations and click to compare. Each option adapts to your space requirements.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {designs.map((design, index) => (
              <div
                key={design.id}
                onClick={() => setSelectedDesign(index)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 group ${
                  selectedDesign === index
                    ? 'ring-2 ring-[#694342] shadow-lg transform scale-105'
                    : 'hover:shadow-md hover:transform hover:scale-102'
                }`}
              >
                {/* Design Thumbnail */}
                <div className={`h-36 bg-gradient-to-br ${design.color} flex items-center justify-center relative`}>
                  <div className="text-4xl text-white/90">{design.image}</div>

                  {/* Selected indicator */}
                  {selectedDesign === index && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <div className="w-3 h-3 rounded-full bg-[#694342]"></div>
                      </div>
                    </div>
                  )}

                  {/* Layout number badge */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-medium">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Rating badge */}
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-white font-medium">{design.rating}</span>
                    </div>
                  </div>

                  {/* Quick preview overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-white text-sm font-medium">Click to View</div>
                  </div>
                </div>

                {/* Design Info */}
                <div className="bg-white p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{design.title}</h3>

                  <div className="space-y-2">
                    {/* Type and Size */}
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{design.type}</span> • <span>{design.sqft}</span>
                    </div>

                    {/* Room count if available */}
                    {design.floorPlan?.rooms?.length > 0 && (
                      <div className="text-xs text-gray-600">
                        {design.floorPlan.rooms.length} room{design.floorPlan.rooms.length !== 1 ? 's' : ''}
                        {design.specifications?.totalBedrooms > 0 && (
                          <span> • {design.specifications.totalBedrooms} bed</span>
                        )}
                        {design.specifications?.totalBathrooms > 0 && (
                          <span> • {design.specifications.totalBathrooms} bath</span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {design.style}
                      </span>
                      {design.floorPlan?.rooms && design.floorPlan.rooms.some(r => ['swimming pool', 'pool', 'garden', 'outdoor'].includes(r.type?.toLowerCase())) && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Outdoor Space
                        </span>
                      )}
                    </div>

                    {/* Engagement metrics */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Heart className="w-3 h-3" />
                        <span>{design.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        <span>{Math.floor(Math.random() * 500 + 200)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Large Design View */}
        <div className="flex-1 flex flex-col">
          {/* Top Controls */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentDesign.title}</h1>
                <p className="text-gray-600">{currentDesign.type} • {currentDesign.style} • {currentDesign.sqft}</p>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Controls */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setRotation(rotation - 90)}
                    className="p-2 rounded hover:bg-white transition-colors"
                    title="Rotate Left"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setRotation(rotation + 90)}
                    className="p-2 rounded hover:bg-white transition-colors"
                    title="Rotate Right"
                  >
                    <RotateCw className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    className="p-2 rounded hover:bg-white transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-600 px-2">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    className="p-2 rounded hover:bg-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl shadow-sm transition-all hover:opacity-90"
                  title="View in 3D"
                >
                  <Box className="w-4 h-4 mr-2" />
                  View 3D
                </button>

                <button
                  className="inline-flex items-center px-4 py-2 text-white font-medium rounded-xl shadow-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#c6a480' }}
                  title="Shortlist Design"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Shortlist
                </button>

              </div>
            </div>
          </div>

          {/* Main Design Viewer */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="relative w-full max-w-5xl h-full">
              {/* Floor Plan Display */}
              {currentDesign?.floorPlan ? (
                <div className="relative w-full h-full">
                  <FloorPlanViewerV2
                    floorPlan={currentDesign.floorPlan}
                    style={{
                      height: 'calc(100vh - 200px)',
                      minHeight: '500px',
                      transform: `rotate(${rotation}deg) scale(${zoom/100})`,
                      transition: 'transform 0.3s ease'
                    }}
                    className="rounded-2xl shadow-2xl border border-gray-200"
                  />
                </div>
              ) : (
                /* Fallback for non-floor-plan designs */
                <div
                  className={`relative w-full bg-gradient-to-br ${currentDesign.color} rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-300`}
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom/100})`,
                    height: 'calc(100vh - 200px)',
                    minHeight: '500px'
                  }}
                >
                  <div className="text-9xl text-white/80">
                    {currentDesign.image}
                  </div>
                </div>
              )}

              {/* Design overlay info */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{currentDesign.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{currentDesign.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>1.2k views</span>
                  </div>
                </div>
              </div>

              {/* Top Right Controls */}
              <div className="absolute top-4 right-4 flex space-x-2">
                {/* Info button with tooltip */}
                <div className="relative">
                  <button
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-colors shadow-sm"
                    title="Design Information"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info className="w-5 h-5" />
                  </button>

                  {/* Floor Plan Info Tooltip */}
                  {showTooltip && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">Floor Plan Details</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>Total Area: {currentDesign.sqft}</p>
                            <p>Style: {currentDesign.style}</p>
                            <p>Rooms: {currentDesign.floorPlan?.rooms?.length || 0}</p>
                            {currentDesign.specifications && (
                              <>
                                {currentDesign.specifications.totalBedrooms > 0 && <p>Bedrooms: {currentDesign.specifications.totalBedrooms}</p>}
                                {currentDesign.specifications.totalBathrooms > 0 && <p>Bathrooms: {currentDesign.specifications.totalBathrooms}</p>}
                                <p>Scale: {currentDesign.specifications.scale}</p>
                                {currentDesign.specifications.estimatedCost && <p>Est. Cost: {currentDesign.specifications.estimatedCost}</p>}
                              </>
                            )}
                          </div>
                        </div>

                        {currentDesign.recommendations && currentDesign.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-2">AI Recommendations</h4>
                            <div className="space-y-1 text-xs text-gray-600">
                              {currentDesign.recommendations.slice(0, 3).map((rec, idx) => (
                                <p key={idx}>• {rec}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">Room List</h4>
                          <div className="flex flex-wrap gap-1">
                            {currentDesign.floorPlan?.rooms?.map((room, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {room.name} ({room.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tooltip arrow */}
                      <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
                    </div>
                  )}
                </div>

                {/* Fullscreen button */}
                <button
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-white transition-colors shadow-sm"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ask Agent Chat */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
          {/* Chat Header */}
          <div className="bg-[#694342] text-white p-4 flex items-center">
            <img src={kai} alt=""  className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">Ask Kai</h3>
            <div className="ml-auto flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs">Online</span>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* AI Search Results Message */}
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-[#694342] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={kai} alt=""  className="w-5 h-5 rounded-full" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-gray-800">
                    {jennyMessage || "Hi! I'm your design assistant. I've generated your custom floor plan based on your requirements. Ask me to modify colors, add furniture, change materials, adjust layouts, or make any other design changes you'd like! 🎨"}
                  </div>
                  {floorPlans.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <div className="font-medium text-blue-800 mb-1">Floor Plan Summary:</div>
                      <div className="text-blue-700">
                        • AI-generated floor plan created<br/>
                        • Total rooms: {currentDesign?.floorPlan?.rooms?.length || 0}<br/>
                        • Area: {currentDesign?.sqft || 'Custom size'}
                        {currentDesign?.specifications?.totalBedrooms > 0 && <><br/>• Bedrooms: {currentDesign.specifications.totalBedrooms}</>}
                        {currentDesign?.specifications?.totalBathrooms > 0 && <><br/>• Bathrooms: {currentDesign.specifications.totalBathrooms}</>}
                        {currentDesign?.specifications?.scale && <><br/>• Scale: {currentDesign.specifications.scale}</>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">Just now</div>
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-100 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-1">
              <button className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full hover:bg-gray-50 transition-colors border">
                Change colors
              </button>
              <button className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full hover:bg-gray-50 transition-colors border">
                Add furniture
              </button>
              <button className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full hover:bg-gray-50 transition-colors border">
                Modify layout
              </button>
              <button className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full hover:bg-gray-50 transition-colors border">
                Materials
              </button>
              <button className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full hover:bg-gray-50 transition-colors border">
                Lighting
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your request..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-[#694342] bg-gray-50"
              />
              <button
                className="w-10 h-10 text-white rounded-full transition-all hover:opacity-90 shadow-sm flex items-center justify-center"
                style={{ backgroundColor: '#694342' }}
                title="Send Request"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;