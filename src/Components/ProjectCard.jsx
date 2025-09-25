import React from "react";
import { Star, Heart, Building2 } from "lucide-react";

const ProjectCard = ({ data }) => {
  // Handle both project and manufacturer data
  const project = {
    id: data.id,
    name: data.name || "Project Name",
    location: data.location || data.type || "Unknown Type",
    rating: data.rating || data.progress/20 || 4.0, // Convert progress to rating-like number
    certifications: Array.isArray(data.certifications) ? data.certifications : (data.rooms ? [`${data.rooms} rooms`, data.sqft] : []),
    capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
    lead_time_days: data.lead_time_days,
    established_year: data.established_year,
    status: data.status,
    progress: data.progress,
    color: data.color,
    image: data.image
  };

  // Truncate name if too long
  const displayName = project.name.length > 20
    ? project.name.substring(0, 20) + "..."
    : project.name;

  // Get first few certifications for display
  const displayCertifications = project.certifications.slice(0, 3);

  return (
    <div className="group relative w-full max-w-sm mx-auto cursor-pointer">
      {/* Image Container */}
      <div className="relative h-48 group-hover:h-68 bg-gray-100 overflow-hidden rounded-t-2xl transition-all duration-500">
        {/* Star Icon */}
        <div className="absolute top-4 right-4 z-10">
          <Star className="w-6 h-6 text-gray-400 hover:text-yellow-400 transition-colors duration-200" />
        </div>

        {/* Status Badge */}
        {project.status && (
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              project.status === 'In Progress' ? 'bg-blue-500 text-white' :
              project.status === 'Review' ? 'bg-orange-500 text-white' :
              project.status === 'Complete' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {project.status}
            </span>
          </div>
        )}

        {/* Main Image */}
        <div className={`relative w-full h-full transition-transform duration-500 group-hover:translate-y-4 ${project.color ? `bg-gradient-to-br ${project.color}` : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center`}>
          {project.image ? (
            <div className="text-6xl opacity-90">{project.image}</div>
          ) : (
            <Building2 className="w-24 h-24 text-white/80" />
          )}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* White Content Panel - Overlaps image with margin top for rounded corners visibility */}
      <div className="bg-white rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl h-48 group-hover:h-28 overflow-hidden -mt-6 relative z-10">
        <div className="p-4">
          {/* Manufacturer Info - Top section */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              {project.image ? (
                <div className="text-lg">{project.image}</div>
              ) : (
                <Building2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900" title={project.name}>
                  {displayName}
                </h3>
                {(project.established_year || project.progress) && (
                  <div className="w-4 h-4 bg-purple-500 rounded" title={project.established_year ? `Est. ${project.established_year}` : `${project.progress}% complete`}></div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{project.location}</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1">{project.rating ? Number(project.rating).toFixed(1) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications - Middle section */}
          <div className="flex gap-2 mb-4 overflow-hidden">
            <div className="flex gap-2 flex-1 min-w-0">
              {displayCertifications.length > 0 ? (
                displayCertifications.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full whitespace-nowrap text-ellipsis overflow-hidden flex-shrink-0 max-w-24">
                    {cert}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full whitespace-nowrap">
                  No details
                </span>
              )}
            </div>
            {project.certifications.length > 3 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex-shrink-0">
                +{project.certifications.length - 3}
              </span>
            )}
          </div>

          {/* Progress/Additional Info Section - Bottom section, gets hidden when panel shrinks */}
          <div className="mt-4">
            {project.progress !== undefined ? (
              <div>
                <div className="text-sm text-gray-600 mb-2">Progress: {project.progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${project.color ? `bg-gradient-to-r ${project.color}` : 'bg-blue-500'} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-600 mb-2">Trusted by:</div>
                <div className="flex flex-wrap gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">T</div>
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
                  <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">M</div>
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">+</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;