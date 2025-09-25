import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bell, Search, Home, Bot, Plus, Clock, Layers, BarChart3, ChevronRight, Zap, Share2 } from 'lucide-react';
import ProjectCard from '../Components/ProjectCard';
import ProjectModal from '../Components/ProjectModal';
import { fetchProjects, setCurrentProject } from '../store/slices/projectsSlice';

const Dashboard2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, loading, error } = useSelector(state => state.projects);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Generate recent activities from projects
  const activities = projects.slice(0, 5).map((project, index) => ({
    action: project.status === 'analysis_complete' ? 'AI optimized layout' :
            project.status === 'files_uploaded' ? 'Files uploaded' :
            project.status === 'draft' ? 'Project created' : 'Status updated',
    project: project.name,
    time: `${index + 1}h ago`
  }));

  // Handle project creation
  const handleCreateProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleProjectCreated = (project) => {
    console.log('✅ New project created:', project);
    // Set as current project and navigate to search page
    dispatch(setCurrentProject(project));
    navigate('/search');
  };

  // Handle project card click
  const handleProjectClick = (project) => {
    dispatch(setCurrentProject(project));
    // Navigate based on project status
    if (project.floorPlan) {
      navigate('/results');
    } else {
      navigate('/search');
    }
  };

  // Calculate project statistics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'analysis_complete').length;
  const inProgressProjects = projects.filter(p =>
    p.status === 'files_uploaded' || p.status === 'analysis_in_progress'
  ).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fef5e6 0%, #f5f5f5 50%, #e5e5e5 100%)' }}>
      {/* Redesigned Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#c6a480] shadow-sm">
        <div className="max-w-full px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Left: Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#694342' }}>
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg md:text-xl font-bold" style={{ color: '#694342' }}>
                ArchiNova
              </h1>
            </div>

            {/* Middle: Search */}
            <div className="hidden md:block flex-1 px-8 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Ask AI to design or search projects..."
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
        {/* Main Project Grid - 2/3 of the screen */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 text-white font-medium rounded-xl shadow-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#694342' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-6 h-6 border-2 border-[#694342] border-t-transparent rounded-full animate-spin"></div>
                <span>Loading projects...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">Failed to load projects: {error}</p>
              <button
                onClick={() => dispatch(fetchProjects())}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started with AI-powered floor plan generation</p>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#7636D9] to-[#E16CDF] text-white font-medium rounded-xl shadow-sm transition-all hover:opacity-90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} onClick={() => handleProjectClick(project)}>
                  <ProjectCard data={project} />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Sidebar - 1/3 of the screen */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-gray-200 p-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                </div>
                <Layers className="w-5 h-5" style={{ color: '#694342' }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
                </div>
                <BarChart3 className="w-5 h-5" style={{ color: '#c6a480' }} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#fef5e6' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#694342' }}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.project}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Creation Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Dashboard2;
