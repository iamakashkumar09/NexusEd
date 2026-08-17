'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lecture {
  id: string;
  title: string;
  videoFile?: File | null;
  videoName: string;
  videoUrl?: string;
  duration: string;
  type: 'video' | 'article';
}

interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

interface CourseForm {
  // Step 1
  title: string;
  subtitle: string;
  category: string;
  level: string;
  language: string;
  // Step 2
  description: string;
  objectives: string[];
  requirements: string[];
  targetAudience: string;
  // Step 3
  sections: Section[];
  // Step 4
  thumbnail: File | null;
  thumbnailPreview: string;
  pricing: 'free' | 'paid';
  price: string;
  promoVideo: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning & AI', 'UI/UX Design', 'DevOps & Cloud', 'Cybersecurity', 'Game Development', 'Business', 'Marketing'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Chinese'];

const STEPS = [
  { id: 1, title: 'Course Basics', desc: 'Title, category & level' },
  { id: 2, title: 'Course Details', desc: 'Description & goals' },
  { id: 3, title: 'Curriculum', desc: 'Sections & lectures' },
  { id: 4, title: 'Publish', desc: 'Thumbnail & pricing' },
];

// ─── Styled Primitives ────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-2)',
  border: '1px solid var(--hairline)', borderRadius: 8,
  padding: '11px 14px', color: 'var(--ink)', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6, display: 'block',
};

function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: '#ff6b6b' }}>*</span>}
      </label>
      {hint && <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginBottom: 8 }}>{hint}</div>}
      {children}
    </div>
  );
}

function FocusInput({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...style }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(94,106,210,0.12)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function FocusTextarea({ style, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputStyle, resize: 'vertical', ...style }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(94,106,210,0.12)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

function FocusSelect({ style, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8f98' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36, cursor: 'pointer', ...style }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(94,106,210,0.12)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {children}
    </select>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ form, setForm }: { form: CourseForm; setForm: React.Dispatch<React.SetStateAction<CourseForm>> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>Course Basics</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>Start with the foundational details that define your course.</p>
      </div>

      <Field label="Course Title" required hint="Your title should be compelling and searchable. Think about what your students will be searching for.">
        <FocusInput
          type="text" value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Complete React & Next.js Developer Bootcamp 2025"
          maxLength={100}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 5, textAlign: 'right' }}>{form.title.length}/100</div>
      </Field>

      <Field label="Course Subtitle" required hint="A brief description that appears under the title on search results.">
        <FocusInput
          type="text" value={form.subtitle}
          onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
          placeholder="e.g. Master modern web development with React 19, Next.js 15, TypeScript and more"
          maxLength={200}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 5, textAlign: 'right' }}>{form.subtitle.length}/200</div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Field label="Category" required>
          <FocusSelect value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </FocusSelect>
        </Field>
        <Field label="Level" required>
          <FocusSelect value={form.level} onChange={e => setForm(prev => ({ ...prev, level: e.target.value }))}>
            <option value="">Select level</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </FocusSelect>
        </Field>
        <Field label="Language" required>
          <FocusSelect value={form.language} onChange={e => setForm(prev => ({ ...prev, language: e.target.value }))}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </FocusSelect>
        </Field>
      </div>
    </div>
  );
}

function Step2({ form, setForm }: { form: CourseForm; setForm: React.Dispatch<React.SetStateAction<CourseForm>> }) {
  const updateListItem = (key: 'objectives' | 'requirements', index: number, value: string) => {
    setForm(prev => {
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  };
  const addListItem = (key: 'objectives' | 'requirements') => {
    setForm(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };
  const removeListItem = (key: 'objectives' | 'requirements', index: number) => {
    setForm(prev => {
      const list = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: list.length ? list : [''] };
    });
  };

  const ListBuilder = ({ label, hint, fieldKey }: { label: string; hint: string; fieldKey: 'objectives' | 'requirements' }) => (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {form[fieldKey].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FocusInput
              type="text" value={item}
              onChange={e => updateListItem(fieldKey, i, e.target.value)}
              placeholder={fieldKey === 'objectives' ? 'e.g. Build full-stack apps with React and Node.js' : 'e.g. Basic knowledge of JavaScript'}
            />
            <button onClick={() => removeListItem(fieldKey, i)} style={{ width: 34, height: 36, borderRadius: 7, border: '1px solid var(--hairline)', background: 'var(--surface-2)', color: 'var(--ink-subtle)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
        <button onClick={() => addListItem(fieldKey)} style={{ alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 7, border: '1px dashed var(--hairline-strong)', background: 'transparent', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add item
        </button>
      </div>
    </Field>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>Course Details</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>A complete description helps students decide if your course is right for them.</p>
      </div>
      <Field label="Course Description" required hint="Describe what your course covers, who it's for, and what they'll learn. Minimum 200 characters.">
        <FocusTextarea
          rows={6} value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Provide a detailed description of your course. Include the main topics, tools, and technologies covered..."
        />
        <div style={{ fontSize: 11, color: form.description.length < 200 ? '#ff6b6b' : 'var(--ink-subtle)', marginTop: 5, textAlign: 'right' }}>
          {form.description.length} / 200 min
        </div>
      </Field>
      <ListBuilder label="What students will learn" hint="Add at least 4 learning outcomes students can expect from this course." fieldKey="objectives" />
      <ListBuilder label="Requirements & prerequisites" hint="List any skills, experience, or tools students need before taking this course." fieldKey="requirements" />
      <Field label="Who is this course for?" hint="Describe your target audience to help students self-select.">
        <FocusTextarea
          rows={3} value={form.targetAudience}
          onChange={e => setForm(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="e.g. This course is for aspiring web developers who know basic HTML/CSS and want to level up..."
        />
      </Field>
    </div>
  );
}

function Step3({ form, setForm }: { form: CourseForm; setForm: React.Dispatch<React.SetStateAction<CourseForm>> }) {
  const addSection = () => {
    const sectionId = 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, { id: sectionId, title: `Section ${prev.sections.length + 1}`, lectures: [] }]
    }));
  };

  const updateSection = (id: string, title: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, title } : s)
    }));
  };

  const removeSection = (id: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
  };

  const addLecture = (sectionId: string) => {
    const lectureId = 'lec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        lectures: [...s.lectures, { id: lectureId, title: 'New Lecture', videoName: '', videoUrl: '', duration: '', type: 'video' }]
      } : s)
    }));
  };

  const updateLecture = useCallback((sectionId: string, lectureId: string, updates: Partial<Lecture>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        lectures: s.lectures.map(l => l.id === lectureId ? { ...l, ...updates } : l)
      } : s)
    }));
  }, [setForm]);

  const removeLecture = (sectionId: string, lectureId: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        lectures: s.lectures.filter(l => l.id !== lectureId)
      } : s)
    }));
  };

  const handleVideoUpload = useCallback((sectionId: string, lectureId: string, fileName: string, videoUrl?: string) => {
    updateLecture(sectionId, lectureId, { videoName: fileName, videoUrl });
  }, [updateLecture]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>Curriculum</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>Build your course structure with sections and lectures. Students learn best with a clear, logical flow.</p>
      </div>

      {/* Info bar */}
      <div style={{ background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--ink-muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span>💡</span>
        <span>Start every section with an overview, and add lectures sequentially. Videos are uploaded securely to YouTube.</span>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {form.sections.map((section, sIdx) => (
          <div key={section.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-subtle)', letterSpacing: '0.06em' }}>SECTION {sIdx + 1}</span>
              <input
                style={{ ...inputStyle, padding: '6px 10px', fontSize: 13, fontWeight: 600, flex: 1 }}
                value={section.title}
                onChange={e => updateSection(section.id, e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
              />
              <button onClick={() => removeSection(section.id)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'var(--surface-3)', color: 'var(--ink-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Lectures */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.lectures.map((lecture, lIdx) => (
                <div key={lecture.id} style={{ background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--hairline)', padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-subtle)', fontWeight: 600, flexShrink: 0 }}>
                      🎬 {lIdx + 1}.
                    </span>
                    <input
                      style={{ ...inputStyle, padding: '6px 10px', fontSize: 13, flex: 1 }}
                      value={lecture.title}
                      onChange={e => updateLecture(section.id, lecture.id, { title: e.target.value })}
                      placeholder="Lecture title..."
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
                    />
                    <button onClick={() => removeLecture(section.id, lecture.id)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--ink-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>

                  {/* Video upload zone */}
                  <VideoUploadZone
                    fileName={lecture.videoName}
                    videoUrl={lecture.videoUrl}
                    onFileSelect={(fileName, videoUrl) => handleVideoUpload(section.id, lecture.id, fileName, videoUrl)}
                  />
                </div>
              ))}

              <button onClick={() => addLecture(section.id)} style={{ alignSelf: 'flex-start', padding: '7px 14px', borderRadius: 7, border: '1px dashed var(--hairline-strong)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget).style.color = 'var(--ink)'; (e.currentTarget).style.borderColor = 'var(--hairline-strong)'; }}
              onMouseLeave={e => { (e.currentTarget).style.color = 'var(--ink-muted)'; (e.currentTarget).style.borderColor = 'var(--hairline)'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Lecture
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addSection} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--primary)', background: 'rgba(94,106,210,0.08)', color: 'var(--primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(94,106,210,0.16)'; }}
      onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(94,106,210,0.08)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Section
      </button>
    </div>
  );
}

function VideoUploadZone({
  fileName,
  videoUrl,
  onFileSelect
}: {
  fileName: string;
  videoUrl?: string;
  onFileSelect: (fileName: string, videoUrl?: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file.');
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    // 1. Get Resumable Upload URL from our backend
    fetch('/api/media/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to get upload URL. Are you logged in?');
      return res.json();
    })
    .then(data => {
      if (!data.uploadUrl || data.uploadUrl === '') {
        throw new Error(data.mediaId || 'No upload URL returned (check media-service logs)');
      }

      // 2. Upload video directly to YouTube Resumable URL using XHR for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      });
      
      xhr.addEventListener('load', () => {
        setUploading(false);
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const ytResponse = JSON.parse(xhr.responseText);
            const videoId = ytResponse.id;
            const finalUrl = videoId ? `https://youtube.com/watch?v=${videoId}` : '';
            onFileSelect(file.name, finalUrl);
          } catch (e) {
            console.error('Failed to parse YouTube response', e);
            onFileSelect(file.name, '');
          }
        } else {
          alert('Upload failed with status ' + xhr.status);
        }
      });
      
      xhr.addEventListener('error', () => {
        setUploading(false);
        alert('Network error during upload');
      });
      
      xhr.open('PUT', data.uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    })
    .catch(err => {
      setUploading(false);
      alert(err.message);
    });

  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (uploading) {
    return (
      <div style={{ padding: '14px 16px', background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Uploading video...</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{Math.round(uploadProgress)}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 999 }}>
          <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.1s' }} />
        </div>
      </div>
    );
  }

  const displayName = fileName || (videoUrl ? `Uploaded Video (${videoUrl.includes('v=') ? videoUrl.split('v=')[1] : videoUrl})` : '');

  if (displayName) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.25)', borderRadius: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#27a644"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8" stroke="#27a644" strokeWidth="2" fill="none"/><line x1="12" y1="3" x2="12" y2="15" stroke="#27a644" strokeWidth="2"/></svg>
        <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
        <button type="button" onClick={() => onFileSelect('', '')} style={{ fontSize: 11, color: 'var(--ink-subtle)', background: 'none', border: 'none', cursor: 'pointer' }}>Change</button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--hairline-strong)'}`,
        borderRadius: 8, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', transition: 'all 0.15s',
        background: dragging ? 'rgba(94,106,210,0.07)' : 'transparent',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)' }}>
          {dragging ? 'Drop video here' : 'Upload video'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>Drag & drop or click · MP4, MOV, AVI</div>
      </div>
      <input ref={inputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
    </div>
  );
}

function Step4({ form, setForm }: { form: CourseForm; setForm: React.Dispatch<React.SetStateAction<CourseForm>> }) {
  const [thumbDragging, setThumbDragging] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnail = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, thumbnail: file, thumbnailPreview: url }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>Publish Your Course</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-subtle)' }}>A great thumbnail and clear pricing will maximize your course enrollments.</p>
      </div>

      {/* Thumbnail */}
      <Field label="Course Thumbnail" required hint="Upload a 16:9 image (1280×720 minimum). High-quality visuals dramatically increase click-through rate.">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Preview */}
          <div style={{ width: 240, height: 135, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--hairline)', background: 'var(--surface-2)', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form.thumbnailPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.thumbnailPreview} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--ink-subtle)' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                <div style={{ fontSize: 11 }}>Preview</div>
              </div>
            )}
          </div>
          {/* Upload zone */}
          <div
            onClick={() => thumbInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setThumbDragging(true); }}
            onDragLeave={() => setThumbDragging(false)}
            onDrop={e => { e.preventDefault(); setThumbDragging(false); if (e.dataTransfer.files[0]) handleThumbnail(e.dataTransfer.files[0]); }}
            style={{
              flex: 1, border: `2px dashed ${thumbDragging ? 'var(--primary)' : 'var(--hairline-strong)'}`,
              borderRadius: 10, padding: '28px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, cursor: 'pointer', transition: 'all 0.15s',
              background: thumbDragging ? 'rgba(94,106,210,0.07)' : 'transparent',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-subtle)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)' }}>
              {thumbDragging ? 'Drop image here' : 'Click or drag image here'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-subtle)', textAlign: 'center' }}>JPG, PNG, WebP · Max 5MB · 1280×720 recommended</div>
            <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleThumbnail(e.target.files[0]); }} />
          </div>
        </div>
      </Field>

      {/* Pricing */}
      <Field label="Pricing" required>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['free', 'paid'] as const).map(type => (
            <button key={type} onClick={() => setForm(prev => ({ ...prev, pricing: type }))} style={{
              flex: 1, padding: '16px 20px', borderRadius: 10,
              border: `2px solid ${form.pricing === type ? 'var(--primary)' : 'var(--hairline)'}`,
              background: form.pricing === type ? 'rgba(94,106,210,0.1)' : 'var(--surface-2)',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{type === 'free' ? '🆓' : '💳'}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: form.pricing === type ? 'var(--primary)' : 'var(--ink)', textTransform: 'capitalize' }}>{type}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-subtle)', marginTop: 2 }}>
                {type === 'free' ? 'Make it accessible to everyone' : 'Set a price for your course'}
              </div>
            </button>
          ))}
        </div>
        {form.pricing === 'paid' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', marginBottom: 6 }}>Course Price (USD)</div>
            <div style={{ position: 'relative', maxWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-subtle)', fontSize: 14, fontWeight: 600 }}>$</span>
              <FocusInput type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="29.99" style={{ paddingLeft: 28 }} min="0" step="0.01" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-subtle)', marginTop: 6 }}>Suggested: $9.99 – $199.99</div>
          </div>
        )}
      </Field>

      {/* Promo video */}
      <Field label="Promotional Video URL" hint="Optional: Link to a YouTube or Vimeo preview video that auto-plays on your course landing page.">
        <FocusInput type="url" value={form.promoVideo} onChange={e => setForm(prev => ({ ...prev, promoVideo: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
      </Field>

      {/* Summary */}
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Course Summary</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Title', value: form.title || '—' },
            { label: 'Category', value: form.category || '—' },
            { label: 'Level', value: form.level || '—' },
            { label: 'Sections', value: `${form.sections.length}` },
            { label: 'Total Lectures', value: `${form.sections.reduce((acc, s) => acc + s.lectures.length, 0)}` },
            { label: 'Pricing', value: form.pricing === 'free' ? 'Free' : (form.price ? `$${form.price}` : 'Paid (price not set)') },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--hairline)' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', maxWidth: '65%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const defaultForm: CourseForm = {
  title: '', subtitle: '', category: '', level: '', language: 'English',
  description: '', objectives: ['', ''], requirements: [''], targetAudience: '',
  sections: [{ id: '1', title: 'Introduction', lectures: [] }],
  thumbnail: null, thumbnailPreview: '', pricing: 'paid', price: '', promoVideo: '',
};

export default function CreateCoursePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CourseForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  // Redirect students away (basic check)
  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.role !== 'INSTRUCTOR' && data.role !== 'instructor') {
          router.replace('/dashboard');
        }
      });
  }, [router]);

  // Load draft on mount
  const isLoadedRef = useRef(false);
  useEffect(() => {
    if (isLoadedRef.current) return;
    isLoadedRef.current = true;
    const draft = localStorage.getItem('course_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object') {
          setForm(prev => ({
            ...prev,
            ...parsed,
            thumbnail: null,
            thumbnailPreview: parsed.thumbnailPreview || '',
            sections: Array.isArray(parsed.sections) && parsed.sections.length > 0
              ? parsed.sections.map((s: any) => ({
                  ...s,
                  lectures: Array.isArray(s.lectures)
                    ? s.lectures.map((l: any) => ({
                        ...l,
                        videoFile: null,
                        videoName: l.videoName || '',
                        videoUrl: l.videoUrl || '',
                      }))
                    : []
                }))
              : prev.sections
          }));
        }
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Auto-save draft to localStorage whenever form changes
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (!form.title && form.sections.length === 1 && form.sections[0].lectures.length === 0 && !form.description) {
      return;
    }
    const draftForm = {
      ...form,
      thumbnail: null,
      thumbnailPreview: form.thumbnailPreview.startsWith('blob:') ? '' : form.thumbnailPreview,
      sections: form.sections.map(s => ({
        ...s,
        lectures: s.lectures.map(l => ({
          id: l.id,
          title: l.title,
          videoName: l.videoName || '',
          videoUrl: l.videoUrl || '',
          duration: l.duration || '',
          type: l.type || 'video',
          videoFile: null
        }))
      }))
    };
    try {
      localStorage.setItem('course_draft', JSON.stringify(draftForm));
    } catch (e) {
      console.warn('Failed to auto-save course draft', e);
    }
  }, [form]);

  const handleSaveDraft = () => {
    const draftForm = {
      ...form,
      thumbnail: null,
      thumbnailPreview: form.thumbnailPreview.startsWith('blob:') ? '' : form.thumbnailPreview,
      sections: form.sections.map(s => ({
        ...s,
        lectures: s.lectures.map(l => ({
          id: l.id,
          title: l.title,
          videoName: l.videoName || '',
          videoUrl: l.videoUrl || '',
          duration: l.duration || '',
          type: l.type || 'video',
          videoFile: null
        }))
      }))
    };
    
    localStorage.setItem('course_draft', JSON.stringify(draftForm));
    alert('Draft saved successfully! You can safely close this page and return later to continue.');
  };

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle,
          category: form.category,
          level: form.level,
          language: form.language,
          description: form.description,
          thumbnailUrl: form.thumbnailPreview || '',
          price: form.pricing === 'free' ? 0 : parseFloat(form.price) || 0,
          status: 'PUBLISHED',
          sections: form.sections.map((section, sIndex) => ({
            title: section.title,
            order: sIndex + 1,
            lectures: section.lectures.map((lecture, lIndex) => ({
              title: lecture.title,
              videoUrl: lecture.videoUrl || '',
              order: lIndex + 1,
            }))
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      setSubmitting(false);
      setSubmitted(true);
      localStorage.removeItem('course_draft');
    } catch (error: any) {
      setSubmitting(false);
      alert(error.message);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: 12 }}>
          Course Submitted!
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-muted)', marginBottom: 32 }}>
          Your course <strong>"{form.title}"</strong> is under review. We'll notify you once it goes live. This usually takes 1-2 business days.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => router.push('/courses')} style={{ padding: '11px 24px', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            View My Courses
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1); setForm(defaultForm); }} style={{ padding: '11px 24px', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--ink)', fontWeight: 600, fontSize: 14, border: '1px solid var(--hairline)', cursor: 'pointer' }}>
            Create Another
          </button>
        </div>
      </div>
    );
  }

  const completedSteps = STEPS.filter(s => {
    if (s.id === 1) return form.title && form.category && form.level;
    if (s.id === 2) return form.description.length >= 200;
    if (s.id === 3) return form.sections.some(s => s.lectures.length > 0);
    return false;
  }).map(s => s.id);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* Page title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-2)', color: 'var(--ink-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            Create New Course
          </h1>
        </div>
        {/* Top progress */}
        <div style={{ flex: 1, display: 'flex', gap: 6, marginLeft: 20 }}>
          {STEPS.map(s => (
            <div key={s.id} onClick={() => setStep(s.id)} style={{ flex: 1, height: 4, borderRadius: 999, background: step >= s.id ? 'var(--primary)' : 'var(--surface-2)', cursor: 'pointer', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Content: sidebar + form */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* Step list sidebar */}
        <aside>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 24 }}>
            {STEPS.map((s, i) => {
              const isDone = completedSteps.includes(s.id);
              const isActive = step === s.id;
              return (
                <button key={s.id} onClick={() => setStep(s.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', background: isActive ? 'rgba(94,106,210,0.1)' : 'transparent',
                  border: 'none', borderBottom: i < STEPS.length - 1 ? '1px solid var(--hairline)' : 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--surface-2)',
                    border: `2px solid ${isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--hairline)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: isDone || isActive ? '#fff' : 'var(--ink-subtle)',
                  }}>
                    {isDone ? '✓' : s.id}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--ink-muted)' }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main form area */}
        <div>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)', borderRadius: 14, padding: 28, marginBottom: 20, boxShadow: 'inset 0 1px 0 rgba(255,255,200,0.05)', minHeight: 500 }}>
            <div key={step} style={{ animation: 'slideIn 0.2s ease' }}>
              {step === 1 && <Step1 form={form} setForm={setForm} />}
              {step === 2 && <Step2 form={form} setForm={setForm} />}
              {step === 3 && <Step3 form={form} setForm={setForm} />}
              {step === 4 && <Step4 form={form} setForm={setForm} />}
            </div>
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleBack} disabled={step === 1} style={{
              padding: '10px 22px', borderRadius: 10, border: '1px solid var(--hairline)',
              background: 'var(--surface-2)', color: step === 1 ? 'var(--ink-subtle)' : 'var(--ink)',
              fontWeight: 600, fontSize: 14, cursor: step === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, opacity: step === 1 ? 0.4 : 1,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>

            <div style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>Step {step} of {STEPS.length}</div>

            {step < 4 ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleSaveDraft} style={{
                  padding: '10px 22px', borderRadius: 10, border: '1px solid var(--hairline-strong)',
                  background: 'transparent', color: 'var(--ink-muted)',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                  Save Draft
                </button>
                <button onClick={handleNext} style={{
                  padding: '10px 22px', borderRadius: 10, border: 'none',
                  background: 'var(--primary)', color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(94,106,210,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}>
                  Continue
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleSaveDraft} disabled={submitting} style={{
                  padding: '10px 22px', borderRadius: 10, border: '1px solid var(--hairline-strong)',
                  background: 'transparent', color: 'var(--ink-muted)',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s', opacity: submitting ? 0.5 : 1
                }}>
                  Save Draft
                </button>
                <button onClick={handleSubmit} disabled={submitting} style={{
                  padding: '10px 28px', borderRadius: 10, border: 'none',
                  background: submitting ? 'var(--surface-2)' : 'var(--success)',
                  color: submitting ? 'var(--ink-subtle)' : '#fff',
                  fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: submitting ? 'none' : '0 4px 16px rgba(39,166,68,0.35)',
                }}>
                  {submitting ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    <>🚀 Publish Course</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

