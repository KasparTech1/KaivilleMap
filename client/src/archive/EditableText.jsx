import React, { useState, useRef, useEffect } from 'react';
import './EditableText.css';

/**
 * Inline editable text component
 * Supports different text types (h1, h2, p, span)
 */
export const EditableText = ({ 
  value, 
  onChange, 
  onSave,
  tag = 'p',
  className = '',
  placeholder = 'Click to edit...',
  isEditing,
  onEditStart,
  onEditEnd
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const elementRef = useRef(null);
  const inputRef = useRef(null);

  const editing = isEditing !== undefined ? isEditing : isLocalEditing;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleClick = () => {
    if (!editing) {
      setIsLocalEditing(true);
      onEditStart?.();
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && tag !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    onSave?.(localValue);
    setIsLocalEditing(false);
    onEditEnd?.(true);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsLocalEditing(false);
    onEditEnd?.(false);
  };

  const handleBlur = () => {
    // Small delay to allow button clicks
    setTimeout(() => {
      if (editing && document.activeElement !== inputRef.current) {
        handleSave();
      }
    }, 200);
  };

  const Tag = tag;
  const inputType = tag === 'textarea' ? 'textarea' : 'input';
  const InputTag = inputType;

  if (editing) {
    return (
      <div className={`editable-text-wrapper editing ${className}`}>
        <InputTag
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`editable-text-input editable-text-${tag}`}
          placeholder={placeholder}
        />
        <div className="editable-text-actions">
          <button 
            className="editable-text-save"
            onClick={handleSave}
            title="Save (Enter)"
          >
            ✓
          </button>
          <button 
            className="editable-text-cancel"
            onClick={handleCancel}
            title="Cancel (Esc)"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag
      ref={elementRef}
      className={`editable-text editable-text-${tag} ${className}`}
      onClick={handleClick}
      title="Click to edit"
    >
      {localValue || <span className="editable-text-placeholder">{placeholder}</span>}
    </Tag>
  );
};