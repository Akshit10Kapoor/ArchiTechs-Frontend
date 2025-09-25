import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Building2, Home, Factory, Store, Coffee } from 'lucide-react';
import { createProject, fetchProjectTypes, clearError } from '../store/slices/projectsSlice';

const ProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const dispatch = useDispatch();
  const { projectTypes, createLoading, createError } = useSelector(state => state.projects);

  // Default project types as fallback
  const defaultProjectTypes = [
    'room layout',
    'factory layout',
    'office layout',
    'retail layout',
    'restaurant layout'
  ];

  // Use fetched project types or default fallback
  const availableProjectTypes = projectTypes.length > 0 ? projectTypes : defaultProjectTypes;

  const [formData, setFormData] = useState({
    name: '',
    sqFeetRange: '',
    projectType: '',
    customProjectType: ''
  });

  const [errors, setErrors] = useState({});


  // Icons for project types
  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'room layout': return Home;
      case 'factory layout': return Factory;
      case 'office layout': return Building2;
      case 'retail layout': return Store;
      case 'restaurant layout': return Coffee;
      default: return Building2;
    }
  };

  // Load project types when modal opens
  useEffect(() => {
    if (isOpen && projectTypes.length === 0) {
      dispatch(fetchProjectTypes()).catch((error) => {
        console.log('Failed to fetch project types, using defaults:', error);
      });
    }
  }, [isOpen, dispatch, projectTypes.length]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      setErrors({});
      setFormData({
        name: '',
        sqFeetRange: '',
        projectType: '',
        customProjectType: ''
      });
    }
  }, [isOpen, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!formData.sqFeetRange) {
      newErrors.sqFeetRange = 'Square footage range is required';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    } else if (formData.projectType === 'other' && !formData.customProjectType.trim()) {
      newErrors.customProjectType = 'Please specify the project type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare the final project data
      const projectData = {
        ...formData,
        projectType: formData.projectType === 'other' ? formData.customProjectType : formData.projectType
      };
      delete projectData.customProjectType; // Remove this field as it's not needed in the API

      const result = await dispatch(createProject(projectData)).unwrap();
      console.log('✅ Project created successfully:', result);

      // Call the callback with the created project
      if (onProjectCreated) {
        onProjectCreated(result.data);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('❌ Failed to create project:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear custom project type error when changing from "other"
    if (name === 'projectType' && value !== 'other' && errors.customProjectType) {
      setErrors(prev => ({
        ...prev,
        customProjectType: null
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={createLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7636D9] transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
              disabled={createLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Square Footage */}
          <div>
            <label htmlFor="sqFeetRange" className="block text-sm font-medium text-gray-700 mb-2">
              Square Footage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="sqFeetRange"
              name="sqFeetRange"
              value={formData.sqFeetRange}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7636D9] transition-colors ${
                errors.sqFeetRange ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter square footage (e.g., 1500 sq ft)"
              disabled={createLoading}
            />
            {errors.sqFeetRange && <p className="mt-1 text-sm text-red-500">{errors.sqFeetRange}</p>}
          </div>

          {/* Project Type */}
          <div>
            <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7636D9] transition-colors ${
                errors.projectType ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={createLoading}
            >
              <option value="">Select project type</option>
              {availableProjectTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
            {errors.projectType && <p className="mt-1 text-sm text-red-500">{errors.projectType}</p>}
          </div>

          {/* Custom Project Type (shown when "other" is selected) */}
          {formData.projectType === 'other' && (
            <div>
              <label htmlFor="customProjectType" className="block text-sm font-medium text-gray-700 mb-2">
                Specify Project Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customProjectType"
                name="customProjectType"
                value={formData.customProjectType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7636D9] transition-colors ${
                  errors.customProjectType ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your project type"
                disabled={createLoading}
              />
              {errors.customProjectType && <p className="mt-1 text-sm text-red-500">{errors.customProjectType}</p>}
            </div>
          )}


          {/* Error Display */}
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{createError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#7636D9] to-[#E16CDF] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {createLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;