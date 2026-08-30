import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Sparkles, User, Code2, Heart, Clock, Briefcase, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import {
  DEPARTMENTS, ACADEMIC_YEARS, SKILL_OPTIONS, INTEREST_OPTIONS,
  AVAILABILITY_OPTIONS, EXPERIENCE_LEVELS,
} from '@/lib/types';

const steps = [
  { icon: User, title: 'Personal Details' },
  { icon: Code2, title: 'Skills' },
  { icon: Heart, title: 'Interests' },
  { icon: Clock, title: 'Availability' },
  { icon: Briefcase, title: 'Experience' },
  { icon: Award, title: 'Certifications & Achievements' },
];

export function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0
  const [department, setDepartment] = useState(profile?.department || '');
  const [academicYear, setAcademicYear] = useState(profile?.academic_year || '');
  const [program, setProgram] = useState(profile?.program || '');
  const [about, setAbout] = useState(profile?.about || '');

  // Step 1
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 2
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 3
  const [availability, setAvailability] = useState('Open to collaborate');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');

  // Step 4
  const [experiences, setExperiences] = useState<{ title: string; organization: string; description: string }[]>([]);

  // Step 5
  const [certs, setCerts] = useState<{ title: string; issuer: string }[]>([]);
  const [achievements, setAchievements] = useState<{ title: string; description: string }[]>([]);

  function toggleSkill(s: string) {
    setSelectedSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }
  function toggleInterest(i: string) {
    setSelectedInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  function next() {
    if (step === 0 && (!department || !academicYear)) {
      toast.error('Please select your department and academic year');
      return;
    }
    if (step === 1 && selectedSkills.length === 0) {
      toast.error('Select at least one skill');
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        department, academic_year: academicYear, program, about,
        availability_status: availability, experience_level: experienceLevel,
        onboarding_complete: true,
      })
      .eq('id', user.id);

    if (profileError) {
      toast.error('Failed to save profile');
      setSaving(false);
      return;
    }

    // Save skills
    if (selectedSkills.length > 0) {
      await supabase.from('profile_skills').delete().eq('profile_id', user.id);
      await supabase.from('profile_skills').insert(
        selectedSkills.map((skill_name) => ({ profile_id: user.id, skill_name, proficiency: 3 }))
      );
    }

    // Save interests
    if (selectedInterests.length > 0) {
      await supabase.from('profile_interests').delete().eq('profile_id', user.id);
      await supabase.from('profile_interests').insert(
        selectedInterests.map((interest_name) => ({ profile_id: user.id, interest_name }))
      );
    }

    // Save experiences
    if (experiences.length > 0) {
      await supabase.from('experiences').insert(
        experiences.filter((e) => e.title).map((e) => ({ profile_id: user.id, ...e }))
      );
    }

    // Save certifications
    if (certs.length > 0) {
      await supabase.from('certifications').insert(
        certs.filter((c) => c.title).map((c) => ({ profile_id: user.id, ...c }))
      );
    }

    // Save achievements
    if (achievements.length > 0) {
      await supabase.from('achievements').insert(
        achievements.filter((a) => a.title).map((a) => ({ profile_id: user.id, ...a }))
      );
    }

    await refreshProfile();
    setSaving(false);
    toast.success('Profile complete! Welcome to NEXORA.');
    navigate('/app');
  }

  return (
    <div className="min-h-screen bg-slatey-50">
      {/* Header */}
      <header className="border-b border-slatey-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container-px mx-auto max-w-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-slatey-900">NEXORA</span>
          </div>
          <span className="text-sm font-medium text-slatey-500">
            Step {step + 1} of {steps.length}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-slatey-100">
        <div
          className="h-full gradient-bg transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="container-px mx-auto max-w-2xl py-12">
        {/* Step indicator dots */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                  i < step ? 'bg-tealx-500 text-white' :
                  i === step ? 'gradient-bg text-white shadow-glow' :
                  'bg-slatey-100 text-slatey-400'
                }`}
              >
                {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={`hidden sm:block text-xs font-medium text-center ${i === step ? 'text-brand-600' : 'text-slatey-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <div className="card p-8 animate-fade-up" key={step}>
          {step === 0 && (
            <StepPersonal
              department={department} setDepartment={setDepartment}
              academicYear={academicYear} setAcademicYear={setAcademicYear}
              program={program} setProgram={setProgram}
              about={about} setAbout={setAbout}
            />
          )}
          {step === 1 && (
            <StepSkills selected={selectedSkills} onToggle={toggleSkill} />
          )}
          {step === 2 && (
            <StepInterests selected={selectedInterests} onToggle={toggleInterest} />
          )}
          {step === 3 && (
            <StepAvailability
              availability={availability} setAvailability={setAvailability}
              experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel}
            />
          )}
          {step === 4 && (
            <StepExperience experiences={experiences} setExperiences={setExperiences} />
          )}
          {step === 5 && (
            <StepCerts
              certs={certs} setCerts={setCerts}
              achievements={achievements} setAchievements={setAchievements}
            />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="btn-secondary disabled:opacity-40 disabled:pointer-events-none">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button onClick={next} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : step === steps.length - 1 ? 'Complete' : 'Continue'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-bold text-slatey-900">{title}</h2>
      <p className="mt-1.5 text-slatey-500">{desc}</p>
    </div>
  );
}

function StepPersonal({ department, setDepartment, academicYear, setAcademicYear, program, setProgram, about, setAbout }: any) {
  return (
    <div>
      <StepTitle title="Personal Details" desc="Tell us about your academic background" />
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slatey-700">Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field">
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slatey-700">Academic Year</label>
          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="input-field">
            <option value="">Select year</option>
            {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slatey-700">Program</label>
          <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} placeholder="e.g. BSc Computer Science" className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slatey-700">About You</label>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} placeholder="A short bio about yourself..." className="input-field resize-none" />
        </div>
      </div>
    </div>
  );
}

function StepSkills({ selected, onToggle }: { selected: string[]; onToggle: (s: string) => void }) {
  return (
    <div>
      <StepTitle title="Your Skills" desc="Select the skills you have — you can change these later" />
      <div className="flex flex-wrap gap-2.5">
        {SKILL_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onToggle(s)}
            className={`tag px-4 py-2 text-sm transition-all ${
              selected.includes(s)
                ? 'bg-brand-600 text-white shadow-glow scale-105'
                : 'bg-slatey-100 text-slatey-600 hover:bg-brand-50 hover:text-brand-600'
            }`}
          >
            {selected.includes(s) && <Check className="h-3.5 w-3.5" />}
            {s}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-slatey-400">{selected.length} skills selected</p>
    </div>
  );
}

function StepInterests({ selected, onToggle }: { selected: string[]; onToggle: (i: string) => void }) {
  return (
    <div>
      <StepTitle title="Your Interests" desc="What are you passionate about?" />
      <div className="flex flex-wrap gap-2.5">
        {INTEREST_OPTIONS.map((i) => (
          <button
            key={i}
            onClick={() => onToggle(i)}
            className={`tag px-4 py-2 text-sm transition-all ${
              selected.includes(i)
                ? 'bg-cyanx-500 text-white shadow-glow-cyan scale-105'
                : 'bg-slatey-100 text-slatey-600 hover:bg-cyanx-50 hover:text-cyanx-600'
            }`}
          >
            {selected.includes(i) && <Check className="h-3.5 w-3.5" />}
            {i}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-slatey-400">{selected.length} interests selected</p>
    </div>
  );
}

function StepAvailability({ availability, setAvailability, experienceLevel, setExperienceLevel }: any) {
  return (
    <div>
      <StepTitle title="Availability & Experience" desc="Let others know when you're free to collaborate" />
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slatey-700">Availability Status</label>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {AVAILABILITY_OPTIONS.map((a) => (
              <button
                key={a}
                onClick={() => setAvailability(a)}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  availability === a
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slatey-200 text-slatey-600 hover:border-brand-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slatey-700">Experience Level</label>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {EXPERIENCE_LEVELS.map((e) => (
              <button
                key={e}
                onClick={() => setExperienceLevel(e)}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                  experienceLevel === e
                    ? 'border-cyanx-500 bg-cyanx-50 text-cyanx-700'
                    : 'border-slatey-200 text-slatey-600 hover:border-cyanx-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepExperience({ experiences, setExperiences }: any) {
  function add() { setExperiences([...experiences, { title: '', organization: '', description: '' }]); }
  function update(i: number, field: string, val: string) {
    const next = [...experiences];
    next[i] = { ...next[i], [field]: val };
    setExperiences(next);
  }
  return (
    <div>
      <StepTitle title="Experience" desc="Add any relevant work, internship, or project experience" />
      <div className="space-y-4">
        {experiences.map((exp: any, i: number) => (
          <div key={i} className="rounded-xl border border-slatey-200 p-4 space-y-3">
            <input value={exp.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Title (e.g. Software Intern)" className="input-field" />
            <input value={exp.organization} onChange={(e) => update(i, 'organization', e.target.value)} placeholder="Organization" className="input-field" />
            <textarea value={exp.description} onChange={(e) => update(i, 'description', e.target.value)} rows={2} placeholder="Brief description..." className="input-field resize-none" />
          </div>
        ))}
        <button onClick={add} className="btn-secondary w-full border-dashed">
          + Add Experience
        </button>
      </div>
    </div>
  );
}

function StepCerts({ certs, setCerts, achievements, setAchievements }: any) {
  function addCert() { setCerts([...certs, { title: '', issuer: '' }]); }
  function updateCert(i: number, field: string, val: string) {
    const next = [...certs]; next[i] = { ...next[i], [field]: val }; setCerts(next);
  }
  function addAch() { setAchievements([...achievements, { title: '', description: '' }]); }
  function updateAch(i: number, field: string, val: string) {
    const next = [...achievements]; next[i] = { ...next[i], [field]: val }; setAchievements(next);
  }
  return (
    <div>
      <StepTitle title="Certifications & Achievements" desc="Showcase your certifications and notable achievements" />
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slatey-500">Certifications</h3>
          <div className="space-y-3">
            {certs.map((c: any, i: number) => (
              <div key={i} className="grid gap-3 sm:grid-cols-2">
                <input value={c.title} onChange={(e) => updateCert(i, 'title', e.target.value)} placeholder="Certification title" className="input-field" />
                <input value={c.issuer} onChange={(e) => updateCert(i, 'issuer', e.target.value)} placeholder="Issuer (e.g. AWS)" className="input-field" />
              </div>
            ))}
            <button onClick={addCert} className="btn-secondary w-full border-dashed text-sm">+ Add Certification</button>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slatey-500">Achievements</h3>
          <div className="space-y-3">
            {achievements.map((a: any, i: number) => (
              <div key={i} className="space-y-3">
                <input value={a.title} onChange={(e) => updateAch(i, 'title', e.target.value)} placeholder="Achievement title" className="input-field" />
                <textarea value={a.description} onChange={(e) => updateAch(i, 'description', e.target.value)} rows={2} placeholder="Description..." className="input-field resize-none" />
              </div>
            ))}
            <button onClick={addAch} className="btn-secondary w-full border-dashed text-sm">+ Add Achievement</button>
          </div>
        </div>
      </div>
    </div>
  );
}
