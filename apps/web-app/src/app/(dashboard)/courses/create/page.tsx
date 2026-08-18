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

const inputClasses = "w-full bg-surface-2 border border-hairline rounded-lg px-3.5 py-[11px] text-ink text-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10";

function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col">
      <label className="text-[13px] font-semibold text-ink-muted mb-1.5 block">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {hint && <div className="text-xs text-ink-subtle mb-2">{hint}</div>}
      {children}
    </div>
  );
}

function FocusInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClasses} ${className || ''}`} />;
}

function FocusTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClasses} resize-y ${className || ''}`} />;
}

function FocusSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputClasses} appearance-none cursor-pointer pr-9 ${className || ''}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8f98' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
    >
      {children}
    </select>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ form, setForm }: { form: CourseForm; setForm: React.Dispatch<React.SetStateAction<CourseForm>> }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight mb-1.5">Course Basics</h2>
        <p className="text-sm text-ink-subtle">Start with the foundational details that define your course.</p>
      </div>

      <Field label="Course Title" required hint="Your title should be compelling and searchable. Think about what your students will be searching for.">
        <FocusInput
          type="text" value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. Complete React & Next.js Developer Bootcamp 2025"
          maxLength={100}
        />
        <div className="text-[11px] text-ink-subtle mt-1.5 text-right">{form.title.length}/100</div>
      </Field>

      <Field label="Course Subtitle" required hint="A brief description that appears under the title on search results.">
        <FocusInput
          type="text" value={form.subtitle}
          onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
          placeholder="e.g. Master modern web development with React 19, Next.js 15, TypeScript and more"
          maxLength={200}
        />
        <div className="text-[11px] text-ink-subtle mt-1.5 text-right">{form.subtitle.length}/200</div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      <div className="flex flex-col gap-2.5">
        {form[fieldKey].map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <FocusInput
              type="text" value={item}
              onChange={e => updateListItem(fieldKey, i, e.target.value)}
              placeholder={fieldKey === 'objectives' ? 'e.g. Build full-stack apps with React and Node.js' : 'e.g. Basic knowledge of JavaScript'}
            />
            <button type="button" onClick={() => removeListItem(fieldKey, i)} className="w-9 h-[42px] rounded-lg border border-hairline bg-surface-2 text-ink-subtle hover:bg-surface-3 transition-colors cursor-pointer shrink-0 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addListItem(fieldKey)} className="self-start px-3.5 py-1.5 rounded-lg border border-dashed border-hairline-strong bg-transparent text-primary text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-primary/5 transition-colors mt-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add item
        </button>
      </div>
    </Field>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight mb-1.5">Course Details</h2>
        <p className="text-sm text-ink-subtle">A complete description helps students decide if your course is right for them.</p>
      </div>
      <Field label="Course Description" required hint="Describe what your course covers, who it's for, and what they'll learn. Minimum 200 characters.">
        <FocusTextarea
          rows={6} value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Provide a detailed description of your course. Include the main topics, tools, and technologies covered..."
        />
        <div className={`text-[11px] mt-1.5 text-right ${form.description.length < 200 ? 'text-error' : 'text-ink-subtle'}`}>
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight mb-1.5">Curriculum</h2>
        <p className="text-sm text-ink-subtle">Build your course structure with sections and lectures. Students learn best with a clear, logical flow.</p>
      </div>

      {/* Info bar */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-[13px] text-ink-muted flex gap-2 items-start">
        <span className="shrink-0 text-base">💡</span>
        <span>Start every section with an overview, and add lectures sequentially. Videos are uploaded securely to YouTube.</span>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {form.sections.map((section, sIdx) => (
          <div key={section.id} className="bg-surface-1 border border-hairline rounded-xl overflow-hidden shadow-sm">
            {/* Section header */}
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-surface-2 border-b border-hairline">
              <span className="text-[11px] font-bold text-ink-subtle tracking-wider shrink-0 hidden sm:block">SECTION {sIdx + 1}</span>
              <span className="text-[11px] font-bold text-ink-subtle tracking-wider shrink-0 sm:hidden">S{sIdx + 1}</span>
              <FocusInput
                className="flex-1 py-1.5 sm:py-2 text-[13px] font-semibold"
                value={section.title}
                onChange={e => updateSection(section.id, e.target.value)}
              />
              <button type="button" onClick={() => removeSection(section.id)} className="w-8 h-8 rounded-lg bg-surface-3 text-ink-subtle hover:bg-surface-4 transition-colors cursor-pointer flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Lectures */}
            <div className="p-3 flex flex-col gap-3">
              {section.lectures.map((lecture, lIdx) => (
                <div key={lecture.id} className="bg-surface-2 rounded-lg border border-hairline p-3">
                  <div className="flex gap-2 items-center mb-3">
                    <span className="text-[11px] text-ink-subtle font-semibold shrink-0">
                      🎬 {lIdx + 1}.
                    </span>
                    <FocusInput
                      className="flex-1 py-1.5 text-[13px]"
                      value={lecture.title}
                      onChange={e => updateLecture(section.id, lecture.id, { title: e.target.value })}
                      placeholder="Lecture title..."
                    />
                    <button type="button" onClick={() => removeLecture(section.id, lecture.id)} className="w-8 h-8 rounded-lg bg-transparent text-ink-subtle hover:text-error hover:bg-error/10 transition-colors cursor-pointer flex items-center justify-center shrink-0">
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

              <button type="button" onClick={() => addLecture(section.id)} className="self-start px-3.5 py-1.5 rounded-lg border border-dashed border-hairline-strong bg-transparent text-ink-muted text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:text-ink hover:border-hairline-strong transition-all mt-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Lecture
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addSection} className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[13px] font-bold cursor-pointer hover:bg-primary/10 transition-colors">
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

    fetch('/api/media/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type, fileSize: file.size })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to get upload URL.');
      return res.json();
    })
    .then(data => {
      if (!data.uploadUrl) throw new Error(data.mediaId || 'No upload URL returned');
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setUploadProgress((e.loaded / e.total) * 100);
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
            onFileSelect(file.name, '');
          }
        } else {
          alert('Upload failed');
        }
      });
      xhr.addEventListener('error', () => { setUploading(false); alert('Network error'); });
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
      <div className="p-3.5 sm:p-4 bg-surface-1 border border-hairline rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-ink-muted">Uploading video...</span>
          <span className="text-xs font-bold text-primary">{Math.round(uploadProgress)}%</span>
        </div>
        <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-100 ease-out" style={{ width: `${uploadProgress}%` }} />
        </div>
      </div>
    );
  }

  const displayName = fileName || (videoUrl ? `Uploaded Video (${videoUrl.includes('v=') ? videoUrl.split('v=')[1] : videoUrl})` : '');

  if (displayName) {
    return (
      <div className="flex items-center gap-2.5 p-2.5 px-3 bg-success/10 border border-success/25 rounded-lg">
        <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="#27a644"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8" stroke="#27a644" strokeWidth="2" fill="none"/><line x1="12" y1="3" x2="12" y2="15" stroke="#27a644" strokeWidth="2"/></svg>
        <span className="text-xs text-success font-medium flex-1 truncate">{displayName}</span>
        <button type="button" onClick={() => onFileSelect('', '')} className="text-[11px] text-ink-subtle hover:text-ink transition-colors shrink-0">Change</button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col sm:flex-row text-center sm:text-left items-center justify-center sm:justify-start gap-3 cursor-pointer transition-all ${dragging ? 'border-primary bg-primary/5' : 'border-hairline-strong hover:bg-surface-2'}`}
    >
      <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path className="text-ink-subtle" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline className="text-ink-subtle" points="17 8 12 3 7 8"/><line className="text-ink-subtle" x1="12" y1="3" x2="12" y2="15"/></svg>
      <div>
        <div className="text-xs font-semibold text-ink-muted mb-0.5">
          {dragging ? 'Drop video here' : 'Upload video'}
        </div>
        <div className="text-[11px] text-ink-subtle">Drag & drop or click · MP4, MOV, AVI</div>
      </div>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight mb-1.5">Publish Your Course</h2>
        <p className="text-sm text-ink-subtle">A great thumbnail and clear pricing will maximize your course enrollments.</p>
      </div>

      {/* Thumbnail */}
      <Field label="Course Thumbnail" required hint="Upload a 16:9 image (1280×720 minimum). High-quality visuals dramatically increase click-through rate.">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start w-full">
          {/* Preview */}
          <div className="w-full sm:w-[240px] aspect-video sm:h-[135px] rounded-xl overflow-hidden border border-hairline bg-surface-2 shrink-0 relative flex items-center justify-center shadow-sm">
            {form.thumbnailPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-ink-subtle">
                <div className="text-2xl mb-1.5">🖼️</div>
                <div className="text-[11px]">Preview</div>
              </div>
            )}
          </div>
          {/* Upload zone */}
          <div
            onClick={() => thumbInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setThumbDragging(true); }}
            onDragLeave={() => setThumbDragging(false)}
            onDrop={e => { e.preventDefault(); setThumbDragging(false); if (e.dataTransfer.files[0]) handleThumbnail(e.dataTransfer.files[0]); }}
            className={`flex-1 w-full border-2 border-dashed rounded-xl py-8 px-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${thumbDragging ? 'border-primary bg-primary/5' : 'border-hairline-strong hover:bg-surface-2'}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-subtle"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div className="text-[13px] font-semibold text-ink-muted">
              {thumbDragging ? 'Drop image here' : 'Click or drag image here'}
            </div>
            <div className="text-[11px] text-ink-subtle text-center">JPG, PNG, WebP · Max 5MB · 1280×720 recommended</div>
            <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleThumbnail(e.target.files[0]); }} />
          </div>
        </div>
      </Field>

      {/* Pricing */}
      <Field label="Pricing" required>
        <div className="flex flex-col sm:flex-row gap-3">
          {(['free', 'paid'] as const).map(type => (
            <button key={type} type="button" onClick={() => setForm(prev => ({ ...prev, pricing: type }))} className={`flex-1 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${form.pricing === type ? 'border-primary bg-primary/10' : 'border-hairline bg-surface-2 hover:border-hairline-strong'}`}>
              <div className="text-base mb-1">{type === 'free' ? '🆓' : '💳'}</div>
              <div className={`text-sm font-bold capitalize ${form.pricing === type ? 'text-primary' : 'text-ink'}`}>{type}</div>
              <div className="text-xs text-ink-subtle mt-0.5">
                {type === 'free' ? 'Make it accessible to everyone' : 'Set a price for your course'}
              </div>
            </button>
          ))}
        </div>
        {form.pricing === 'paid' && (
          <div className="mt-3">
            <div className="text-[13px] font-semibold text-ink-muted mb-1.5">Course Price (USD)</div>
            <div className="relative max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle text-sm font-semibold">$</span>
              <FocusInput type="number" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} placeholder="29.99" className="pl-7" min="0" step="0.01" />
            </div>
            <div className="text-[11px] text-ink-subtle mt-1.5">Suggested: $9.99 – $199.99</div>
          </div>
        )}
      </Field>

      {/* Promo video */}
      <Field label="Promotional Video URL" hint="Optional: Link to a YouTube or Vimeo preview video that auto-plays on your course landing page.">
        <FocusInput type="url" value={form.promoVideo} onChange={e => setForm(prev => ({ ...prev, promoVideo: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
      </Field>

      {/* Summary */}
      <div className="bg-surface-1 border border-hairline rounded-xl p-5 shadow-sm">
        <div className="text-sm font-bold text-ink mb-3.5">Course Summary</div>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Title', value: form.title || '—' },
            { label: 'Category', value: form.category || '—' },
            { label: 'Level', value: form.level || '—' },
            { label: 'Sections', value: `${form.sections.length}` },
            { label: 'Total Lectures', value: `${form.sections.reduce((acc, s) => acc + s.lectures.length, 0)}` },
            { label: 'Pricing', value: form.pricing === 'free' ? 'Free' : (form.price ? `$${form.price}` : 'Paid (price not set)') },
          ].map((item, i) => (
            <div key={i} className="flex justify-between py-1.5 border-b border-hairline last:border-0">
              <span className="text-xs text-ink-subtle">{item.label}</span>
              <span className="text-xs font-semibold text-ink max-w-[65%] text-right truncate">{item.value}</span>
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
        headers: { 'Content-Type': 'application/json' },
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

      if (!response.ok) throw new Error('Failed to create course');

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
      <div className="max-w-[600px] mx-auto mt-20 text-center px-4">
        <div className="text-6xl mb-5">🎉</div>
        <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-3">
          Course Submitted!
        </h1>
        <p className="text-[15px] text-ink-muted mb-8 leading-relaxed">
          Your course <strong className="text-ink">"{form.title}"</strong> is under review. We'll notify you once it goes live. This usually takes 1-2 business days.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.push('/courses')} className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm border-none cursor-pointer shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
            View My Courses
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1); setForm(defaultForm); }} className="px-6 py-3 rounded-xl bg-surface-2 text-ink font-semibold text-sm border border-hairline cursor-pointer hover:bg-surface-3 transition-colors w-full sm:w-auto">
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
    <div className="max-w-[1000px] mx-auto w-full pb-10">

      {/* Page title row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl border border-hairline bg-surface-2 text-ink-subtle cursor-pointer flex items-center justify-center shrink-0 hover:bg-surface-3 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight leading-none">
            Create Course
          </h1>
        </div>
        {/* Top progress (hidden on desktop, uses horizontal bar) */}
        <div className="flex-1 flex gap-1.5 sm:ml-4">
          {STEPS.map(s => (
            <div key={s.id} onClick={() => setStep(s.id)} className={`flex-1 h-1.5 rounded-full cursor-pointer transition-colors ${step >= s.id ? 'bg-primary' : 'bg-surface-2 hover:bg-surface-3'}`} />
          ))}
        </div>
      </div>

      {/* Content: sidebar + form */}
      <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr] gap-6 sm:gap-8">

        {/* Step list sidebar - horizontal on mobile, vertical on desktop */}
        <aside className="w-full">
          <div className="flex lg:flex-col lg:sticky lg:top-6 bg-surface-1 border border-hairline rounded-2xl overflow-x-auto lg:overflow-hidden scrollbar-hide shadow-sm p-1.5 lg:p-0">
            {STEPS.map((s, i) => {
              const isDone = completedSteps.includes(s.id);
              const isActive = step === s.id;
              return (
                <button key={s.id} onClick={() => setStep(s.id)} className={`
                  flex items-center gap-3 py-2 px-3 lg:p-4 border-none cursor-pointer text-left transition-all shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal rounded-xl lg:rounded-none
                  ${isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-surface-2'}
                  ${i < STEPS.length - 1 ? 'lg:border-b lg:border-hairline' : ''}
                `}>
                  <div className={`
                    w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-colors
                    ${isDone ? 'bg-success border-2 border-success text-white' : isActive ? 'bg-primary border-2 border-primary text-white' : 'bg-surface-2 border-2 border-hairline text-ink-subtle'}
                  `}>
                    {isDone ? '✓' : s.id}
                  </div>
                  <div>
                    <div className={`text-[13px] font-bold ${isActive ? 'text-primary' : 'text-ink-muted'}`}>{s.title}</div>
                    <div className="text-[11px] text-ink-subtle hidden lg:block mt-0.5">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main form area */}
        <div className="flex flex-col min-w-0">
          <div className="bg-surface-1 border border-hairline rounded-2xl p-5 sm:p-8 mb-6 shadow-sm min-h-[500px]">
            <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
              {step === 1 && <Step1 form={form} setForm={setForm} />}
              {step === 2 && <Step2 form={form} setForm={setForm} />}
              {step === 3 && <Step3 form={form} setForm={setForm} />}
              {step === 4 && <Step4 form={form} setForm={setForm} />}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="sticky bottom-0 z-20 bg-black sm:bg-transparent -mx-4 px-4 pb-6 pt-4 sm:mx-0 sm:px-0 sm:pb-0 sm:pt-6 border-t border-hairline flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <button onClick={handleBack} disabled={step === 1} className={`
              px-5 py-2.5 rounded-xl border border-hairline bg-surface-2 font-semibold text-sm flex items-center justify-center gap-2 w-full sm:w-auto transition-colors
              ${step === 1 ? 'text-ink-subtle cursor-not-allowed opacity-50' : 'text-ink cursor-pointer hover:bg-surface-3'}
            `}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>

            <div className="text-xs font-semibold text-ink-subtle hidden sm:block">Step {step} of {STEPS.length}</div>

            {step < 4 ? (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <button onClick={handleSaveDraft} className="px-5 py-2.5 rounded-xl border border-hairline-strong bg-transparent text-ink-muted font-semibold text-sm cursor-pointer hover:bg-surface-2 transition-colors w-full sm:w-auto">
                  Save Draft
                </button>
                <button onClick={handleNext} className="px-6 py-2.5 rounded-xl border-none bg-primary text-white font-bold text-sm cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                  Continue
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <button onClick={handleSaveDraft} disabled={submitting} className={`px-5 py-2.5 rounded-xl border border-hairline-strong bg-transparent text-ink-muted font-semibold text-sm cursor-pointer hover:bg-surface-2 transition-colors w-full sm:w-auto ${submitting ? 'opacity-50' : ''}`}>
                  Save Draft
                </button>
                <button onClick={handleSubmit} disabled={submitting} className={`
                  px-7 py-2.5 rounded-xl border-none font-bold text-sm flex items-center justify-center gap-2 w-full sm:w-auto transition-all
                  ${submitting ? 'bg-surface-2 text-ink-subtle cursor-not-allowed' : 'bg-success text-white cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5'}
                `}>
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </div>
  );
}
