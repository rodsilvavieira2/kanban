import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvailableTags } from '../services/projectService';

export function CreateTask() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTags = async () => {
      const tags = await getAvailableTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, []);

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim();
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      setSelectedTags([...selectedTags, normalizedTag]);
      // If it's a new tag, add it to available tags for this session
      if (!availableTags.includes(normalizedTag)) {
        setAvailableTags([...availableTags, normalizedTag]);
      }
    }
    setTagInput('');
    setIsDropdownOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredTags = availableTags.filter(
    tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(tag)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="create-task-view">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button className="icon-button back-button" onClick={handleCancel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        </div>
        <div className="kanban-header-right">
        </div>
      </div>

      <div className="create-task-content">
        <div className="create-task-page-header">
          <div className="title-section">
            <h1>Create New Task</h1>
            <p>Add a new task to your workspace</p>
          </div>
          <div className="header-actions">
            <button className="btn-danger" onClick={handleCancel}>Cancel</button>
            <button className="btn-primary">Create Task</button>
          </div>
        </div>

        <div className="create-task-form-layout">
          <div className="form-main-column">
            <div className="form-section-card">
              <div className="form-section-header">
                <h3>General Info</h3>
              </div>
              <div className="form-section-body">
                <div className="form-group">
                  <input type="text" className="form-input large-input" placeholder="Task Name" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-textarea" placeholder="Provide details about this task..."></textarea>
                </div>
                <div className="form-group" ref={dropdownRef}>
                  <label>Tags</label>
                  <div className="tag-system-container">
                    <div className="tag-input-wrapper">
                      {selectedTags.map(tag => (
                        <span key={tag} className="tag-chip">
                          {tag}
                          <button className="remove-tag" onClick={() => removeTag(tag)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text" 
                        className="tag-bare-input" 
                        placeholder={selectedTags.length === 0 ? "Select or create tags..." : ""}
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    {isDropdownOpen && (tagInput || filteredTags.length > 0) && (
                      <div className="tags-dropdown">
                        {filteredTags.map(tag => (
                          <div key={tag} className="tag-option" onClick={() => addTag(tag)}>
                            {tag}
                          </div>
                        ))}
                        {tagInput && !availableTags.some(t => t.toLowerCase() === tagInput.toLowerCase()) && (
                          <div className="tag-option create-option" onClick={() => addTag(tagInput)}>
                            Create "<span>{tagInput}</span>"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
