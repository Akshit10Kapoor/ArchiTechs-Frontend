import React, { useState, useRef } from "react";
import bgImage from "../assets/bg.jpg";
import jenny from "../assets/jenny.svg"
import { Plus, Mic, ArrowRight, X, FileText, Trash } from "lucide-react";
import FileUpload from "../Components/FileUpload";
import { useNavigate } from "react-router-dom";
import { aiSearchService } from "../services/api";

const Search = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showLeadTime, setShowLeadTime] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showCertification, setShowCertification] = useState(false);
  const [selectedLeadTimes, setSelectedLeadTimes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const fileInputRef = useRef(null);
  const [desc, setDesc] = useState(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const navigate = useNavigate()

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = async () => {
    if (!desc && completedFiles.length === 0) {
      alert('Please provide a description or upload files');
      return;
    }

    setIsAIProcessing(true);

    try {
      // Enhanced description with filters
      let enhancedDescription = desc || '';
      if (selectedLeadTimes.length > 0) {
        enhancedDescription += ` Lead time requirements: ${selectedLeadTimes.join(', ')}.`;
      }
      if (selectedLocations.length > 0) {
        enhancedDescription += ` Location preferences: ${selectedLocations.join(', ')}.`;
      }
      if (selectedCertifications.length > 0) {
        enhancedDescription += ` Required certifications: ${selectedCertifications.join(', ')}.`;
      }

      console.log('🔍 Starting smart AI search with:', {
        files: completedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
        description: desc,
        enhancedDescription,
        filters: {
          leadTimes: selectedLeadTimes,
          locations: selectedLocations,
          certifications: selectedCertifications
        },
        apiParameters: {
          generateMultipleLayouts: true,
          layoutCount: 6,
          allowNonStandardSpaces: true,
          dynamicRoomGeneration: true
        }
      });

      // Trigger smart AI search with files and enhanced description
      const response = await aiSearchService.initializeSearch(
        completedFiles,
        enhancedDescription,
        'anonymous'
      );

      if (response.success) {
        console.log('🎯 Backend Response Analysis:', {
          conversationId: response.conversationId,
          hasMultipleAnalyses: !!response.multipleAnalyses,
          analysesCount: response.multipleAnalyses?.length || 0,
          hasAnalysis: !!response.analysis,
          hasFloorPlan: response.searchMetadata?.hasFloorPlan,
          hasProcessingIssues: response.searchMetadata?.hasProcessingIssues,
          jennyResponse: response.jennyResponse?.message,
          fullResponse: response
        });

        // Log the issue if backend has processing problems
        if (response.searchMetadata?.hasProcessingIssues) {
          console.error('❌ Backend reported processing issues:', {
            message: response.jennyResponse?.message,
            metadata: response.searchMetadata
          });
        }

        // Store floor plan data for the results page
        sessionStorage.setItem('aiSearchResults', JSON.stringify(response));

        navigate("/search-result");
      }
    } catch (error) {
      console.error('Smart AI Search failed:', error);
      alert('Smart AI search encountered an issue: ' + error.message + '. Please try again or contact support.');
    } finally {
      setIsAIProcessing(false);
    }
  }

  const handleFileSelect = (selectedFiles) => {
    if (selectedFiles && selectedFiles.length > 0) {
      // Convert FileList to array with unique id property
      const newFileArray = Array.from(selectedFiles).map((file, index) => ({
        id: `${Date.now()}_${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file
      }));

      // Add to existing files or start new upload session
      if (isUploading) {
        // If already uploading, add to existing files
        setFiles(prevFiles => [...prevFiles, ...newFileArray]);
      } else {
        // Start new upload session
        setFiles(newFileArray);
        setIsUploading(true);
      }
    }
  };

  const handleUploadComplete = () => {
    console.log('Upload completed - triggering smart processing');
    // Move completed files to completedFiles array and reset upload state
    // Only add files that aren't already in completedFiles (prevent duplicates)
    const newCompletedFiles = (() => {
      const existingIds = new Set(completedFiles.map(f => f.id));
      const newFiles = files.filter(f => !existingIds.has(f.id));
      return [...completedFiles, ...newFiles];
    })();

    setCompletedFiles(newCompletedFiles);

    // Immediate smooth transition
    setIsUploading(false);
    setFiles([]);

    // Smart trigger: If files are uploaded and there's a description, offer to start search
    if (newCompletedFiles.length > 0 && desc?.trim()) {
      const confirmAutoSearch = window.confirm(
        `Great! I see you've uploaded ${newCompletedFiles.length} file(s) and provided a description. Would you like me to start analyzing these right away to find the best manufacturers for you?`
      );

      if (confirmAutoSearch) {
        // Auto-trigger the search
        setTimeout(() => {
          handleSearch();
        }, 500);
      }
    } else if (newCompletedFiles.length > 0) {
      // Just files, suggest adding description
      console.log('Files uploaded, suggesting description for better results');
    }
  };

  const handleUploadCancel = () => {
    setIsUploading(false);
    setFiles([]);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleRemoveCompletedFile = (fileId) => {
    setCompletedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleAddFiltersClick = () => {
    setShowFilters(!showFilters);
  };

  const handleLeadTimeClick = () => {
    if (showLeadTime) {
      setShowLeadTime(false);
    } else {
      setShowLeadTime(true);
      setShowLocation(false);
      setShowCertification(false);
    }
  };

  const handleLocationClick = () => {
    if (showLocation) {
      setShowLocation(false);
    } else {
      setShowLocation(true);
      setShowLeadTime(false);
      setShowCertification(false);
    }
  };

  const handleCertificationClick = () => {
    if (showCertification) {
      setShowCertification(false);
    } else {
      setShowCertification(true);
      setShowLeadTime(false);
      setShowLocation(false);
    }
  };

  const handleLeadTimeOptionClick = (option) => {
    setSelectedLeadTimes(prev => {
      if (prev.includes(option)) {
        // Remove if already selected
        return prev.filter(item => item !== option);
      } else {
        // Add if not selected
        return [...prev, option];
      }
    });
  };

  const handleLocationOptionClick = (option) => {
    setSelectedLocations(prev => {
      if (prev.includes(option)) {
        // Remove if already selected
        return prev.filter(item => item !== option);
      } else {
        // Add if not selected
        return [...prev, option];
      }
    });
  };

  const handleCertificationOptionClick = (option) => {
    setSelectedCertifications(prev => {
      if (prev.includes(option)) {
        // Remove if already selected
        return prev.filter(item => item !== option);
      } else {
        // Add if not selected
        return [...prev, option];
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
<div
  className="h-screen flex flex-col items-center justify-center"
  style={{
    background: `linear-gradient(135deg, rgba(105, 67, 66, 0.05) 0%, rgba(198, 164, 128, 0.08) 50%, rgba(240, 235, 225, 0.1) 100%), url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
        <div className="text-2xl text-center font-semibold bg-gradient-to-r from-[#694342] to-[#c6a480] bg-clip-text text-transparent leading-normal py-2">
          Design Your Space, Instantly.
        </div>
        <div className="text-base text-center">
          Tell Luna your vision — she'll draw the plans instantly.
        </div>

        <div className="mt-8 max-w-4xl w-full px-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {/* Filter Options with smooth transition */}
            <div className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              (showLeadTime || showLocation || showCertification) && showFilters && !isUploading ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0 overflow-hidden mb-0'
            }`}>
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative">
                  {/* Lead Time Options */}
                  <div className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    showLeadTime
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                  }`}>
                    <div className="flex items-center justify-center gap-6 py-3">
                      {['< 7 days', '1–2 weeks', '2–4 weeks', '1–3 months'].map((option, index) => (
                        <button
                          key={option}
                          onClick={() => handleLeadTimeOptionClick(option)}
                          className={`px-4 py-2 text-sm font-medium rounded transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center gap-2 border transform hover:scale-105 ${
                            selectedLeadTimes.includes(option)
                              ? 'bg-[#f1ebfb] text-gray-900 border-[#7636D9] shadow-sm'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-white border-transparent hover:shadow-sm'
                          }`}
                          style={{
                            animationDelay: showLeadTime ? `${index * 100}ms` : '0ms',
                            animation: showLeadTime ? 'slideInUp 0.6s ease-out forwards' : 'none'
                          }}
                        >
                          <span>{option}</span>
                          {selectedLeadTimes.includes(option) && (
                            <X size={16} className="text-gray-700 transition-transform duration-200 hover:scale-110" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Options */}
                  <div className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    showLocation
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                  }`}>
                    <div className="flex items-center justify-center gap-6 py-3">
                      {['North America', 'Europe', 'Asia Pacific', 'Latin America'].map((option, index) => (
                        <button
                          key={option}
                          onClick={() => handleLocationOptionClick(option)}
                          className={`px-4 py-2 text-sm font-medium rounded transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center gap-2 border transform hover:scale-105 ${
                            selectedLocations.includes(option)
                              ? 'bg-[#f1ebfb] text-gray-900 border-[#7636D9] shadow-sm'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-white border-transparent hover:shadow-sm'
                          }`}
                          style={{
                            animationDelay: showLocation ? `${index * 100}ms` : '0ms',
                            animation: showLocation ? 'slideInUp 0.6s ease-out forwards' : 'none'
                          }}
                        >
                          <span>{option}</span>
                          {selectedLocations.includes(option) && (
                            <X size={16} className="text-gray-700 transition-transform duration-200 hover:scale-110" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Certification Options */}
                  <div className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    showCertification
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                  }`}>
                    <div className="flex items-center justify-center gap-6 py-3">
                      {['ISO 9001', 'ISO 14001', 'AS9100', 'IATF 16949'].map((option, index) => (
                        <button
                          key={option}
                          onClick={() => handleCertificationOptionClick(option)}
                          className={`px-4 py-2 text-sm font-medium rounded transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center gap-2 border transform hover:scale-105 ${
                            selectedCertifications.includes(option)
                              ? 'bg-[#f1ebfb] text-gray-900 border-[#7636D9] shadow-sm'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 bg-white border-transparent hover:shadow-sm'
                          }`}
                          style={{
                            animationDelay: showCertification ? `${index * 100}ms` : '0ms',
                            animation: showCertification ? 'slideInUp 0.6s ease-out forwards' : 'none'
                          }}
                        >
                          <span>{option}</span>
                          {selectedCertifications.includes(option) && (
                            <X size={16} className="text-gray-700 transition-transform duration-200 hover:scale-110" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spacer to maintain height */}
                  <div className="opacity-0 pointer-events-none">
                    <div className="flex items-center justify-center gap-6 py-3">
                      <div className="px-4 py-2 text-sm">Spacer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content container with dynamic height for smooth transitions */}
            <div className={`relative mb-4 transition-all duration-500 ease-in-out ${
              isUploading ? 'h-auto' : 'h-16 overflow-hidden'
            }`}>

              {/* Jenny section with cross-fade */}
              <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                !isUploading && !showFilters
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
              }`}>
                <div className="flex items-center h-full">
                  <div className="w-10 h-10 rounded-full mr-3 border-2 overflow-hidden" style={{ borderColor: '#E16CDF' }}>
                    <img
                      src={jenny}
                      alt="Jenny"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-black font-medium">
                    Ready to create? I'm Luna. I turn your descriptions into detailed floor plans.
                  </div>
                </div>
              </div>

              {/* Filter options with cross-fade */}
              <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                showFilters && !isUploading
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              }`}>
                <div className="flex items-center justify-center gap-4 h-full">
                  <button
                    onClick={handleLeadTimeClick}
                    className={`flex items-center gap-2 px-4 py-2 pl-1 border rounded-lg transition-all duration-300 hover:scale-105 ${
                      showLeadTime
                        ? 'bg-[#7636D9] border-[#7636D9] text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1 rounded ${showLeadTime ? '' : ''}`} style={{ backgroundColor: showLeadTime ? 'transparent' : '#F2F4F7' }}>
                      <Plus size={20} className={showLeadTime ? 'text-white' : ''} />
                    </div>
                    <span className="text-sm font-medium">Lead Time</span>
                  </button>

                  <button
                    onClick={handleLocationClick}
                    className={`flex items-center gap-2 px-4 py-2 pl-1 border rounded-lg transition-all duration-300 hover:scale-105 ${
                      showLocation
                        ? 'bg-[#7636D9] border-[#7636D9] text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1 rounded ${showLocation ? '' : ''}`} style={{ backgroundColor: showLocation ? 'transparent' : '#F2F4F7' }}>
                      <Plus size={20} className={showLocation ? 'text-white' : ''} />
                    </div>
                    <span className="text-sm font-medium">Location</span>
                  </button>

                  <button
                    onClick={handleCertificationClick}
                    className={`flex items-center gap-2 px-4 py-2 pl-1 border rounded-lg transition-all duration-300 hover:scale-105 ${
                      showCertification
                        ? 'bg-[#7636D9] border-[#7636D9] text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1 rounded ${showCertification ? '' : ''}`} style={{ backgroundColor: showCertification ? 'transparent' : '#F2F4F7' }}>
                      <Plus size={20} className={showCertification ? 'text-white' : ''} />
                    </div>
                    <span className="text-sm font-medium">Certifications</span>
                  </button>
                </div>
              </div>

              {/* Upload section */}
              <div className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isUploading
                  ? 'opacity-100 translate-y-0 scale-100 relative'
                  : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute inset-0'
              }`}>
                <FileUpload
                  files={files}
                  onUploadComplete={handleUploadComplete}
                  onCancel={handleUploadCancel}
                  onRemoveFile={handleRemoveFile}
                />
              </div>

            </div>

            <div className="relative">
              <textarea
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe your part, material, or requirement..."
                className="w-full h-28 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-500 text-gray-700 placeholder-gray-400"
              />

              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-4">
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-4 py-2 pl-1 border border-gray-200 rounded-lg transition-colors bg-white hover:bg-gray-50"
                  >
                    <div className="p-1 rounded" style={{ backgroundColor: '#F2F4F7' }}>
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium">Upload Design</span>
                  </button>

                  <button
                    onClick={handleAddFiltersClick}
                    className="flex items-center gap-2 px-4 py-2 pl-1 border border-gray-200 rounded-lg transition-colors bg-white hover:bg-gray-50"
                  >
                    <div className="p-1 rounded" style={{ backgroundColor: '#F2F4F7' }}>
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium">Add Filters</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg transition-colors border border-gray-200">
                    <Mic size={20} className="text-gray-600" />
                  </button>

                  <button
                    className="p-2 rounded-lg transition-colors bg-white border-2 disabled:opacity-50"
                    style={{ borderColor: '#7636D9' }}
                    onClick={handleSearch}
                    disabled={isAIProcessing}>
                    {isAIProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#7636D9' }} />
                    ) : (
                      <ArrowRight size={20} style={{ color: '#7636D9' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Selected Filter Tags with smooth expansion */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                (selectedLeadTimes.length > 0 || selectedLocations.length > 0 || selectedCertifications.length > 0) ? 'max-h-20 opacity-100 mt-4 mb-4' : 'max-h-0 opacity-0 mt-0 mb-0'
              }`}>
                <div className="flex flex-wrap gap-2">
                  {selectedLeadTimes.map((leadTime, index) => (
                    <div
                      key={leadTime}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded transition-all duration-300 ease-in-out"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'slideInTag 0.4s ease-out forwards'
                      }}
                    >
                      <span>{leadTime}</span>
                      <button
                        onClick={() => handleLeadTimeOptionClick(leadTime)}
                        className="hover:bg-gray-200 rounded p-0.5 transition-colors duration-200"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  ))}
                  {selectedLocations.map((location, index) => (
                    <div
                      key={location}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded transition-all duration-300 ease-in-out"
                      style={{
                        animationDelay: `${(selectedLeadTimes.length + index) * 50}ms`,
                        animation: 'slideInTag 0.4s ease-out forwards'
                      }}
                    >
                      <span>{location}</span>
                      <button
                        onClick={() => handleLocationOptionClick(location)}
                        className="hover:bg-gray-200 rounded p-0.5 transition-colors duration-200"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  ))}
                  {selectedCertifications.map((certification, index) => (
                    <div
                      key={certification}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded transition-all duration-300 ease-in-out"
                      style={{
                        animationDelay: `${(selectedLeadTimes.length + selectedLocations.length + index) * 50}ms`,
                        animation: 'slideInTag 0.4s ease-out forwards'
                      }}
                    >
                      <span>{certification}</span>
                      <button
                        onClick={() => handleCertificationOptionClick(certification)}
                        className="hover:bg-gray-200 rounded p-0.5 transition-colors duration-200"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Files Grid */}
              {completedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {completedFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-[#fef0fe] p-2 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="" />
                        </div>
                        <div className="flex items-center justify-between w-full min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className="text-xs font-normal ml-2 flex-shrink-0">{formatFileSize(file.size)}</span>
                      <button
                        onClick={() => handleRemoveCompletedFile(file.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                      >
                        <Trash size={19} className="" />
                      </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.dwg,.dxf,.step,.stp,.iges,.igs,.stl,.obj,.3dm,.sat,.x_t,.x_b,.xlsx,.xls,.csv,.txt"
          onChange={(e) => {
            handleFileSelect(e.target.files);
            e.target.value = ''; // Clear input to allow selecting same files again
          }}
          className="hidden"
        />
    </div>
  );
};
export default Search;