"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';
import { ChevronRight, Save, X, Plus, Trash2 } from 'lucide-react';

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizer: '',
    contact: '',
    rulebook: '',
    grades: [] as string[],
    minAge: '',
    maxAge: '',
    registrationStartDate: '',
    registrationEndDate: '',
    competitionStartDate: '',
    competitionEndDate: '',
    maxParticipants: '',
    prizeDetails: '',
    status: 'draft',
  });

  const [rounds, setRounds] = useState([{
    name: 'Round 1',
    type: 'online',
    timer: '60',
    passingScore: '50',
    numberOfQualifiers: '100',
    startDate: '',
    endDate: '',
    venue: '',
    hall: '',
    room: ''
  }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoundChange = (index: number, field: string, value: string) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  };

  const addRound = () => {
    setRounds(prev => [...prev, {
      name: `Round ${prev.length + 1}`,
      type: 'online',
      timer: '60',
      passingScore: '50',
      numberOfQualifiers: '100',
      startDate: '',
      endDate: '',
      venue: '',
      hall: '',
      room: ''
    }]);
  };

  const removeRound = (index: number) => {
    if (rounds.length > 1) {
      setRounds(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grades: formData.grades.length > 0 ? formData.grades : ['All'],
          maxParticipants: Number(formData.maxParticipants),
          rounds: rounds.map(r => ({
            ...r,
            timer: Number(r.timer),
            passingScore: Number(r.passingScore),
            numberOfQualifiers: Number(r.numberOfQualifiers),
          }))
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to create competition';
        try {
          const data = await response.json();
          if (data.error) errorMsg = data.error;
        } catch {
          errorMsg = `Server error (${response.status}): The server encountered an error and could not process the request.`;
        }
        throw new Error(errorMsg);
      }

      router.push('/admin/competitions');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/admin" className="hover:text-brand-primary transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/admin/competitions" className="hover:text-brand-primary transition-colors">Competitions</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Create New</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Competition</h1>
          <p className="text-gray-600">Setup a new competition and its rounds</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <GlassCard className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">General Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
            <Input label="Organizer" name="organizer" value={formData.organizer} onChange={handleInputChange} required />
            <Input label="Contact" name="contact" value={formData.contact} onChange={handleInputChange} required />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
              >
                {['draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled'].map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
                rows={3}
              />
            </div>
            <div className="w-full md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Prize Details</label>
              <textarea 
                name="prizeDetails"
                value={formData.prizeDetails}
                onChange={handleInputChange}
                required
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
                rows={2}
              />
            </div>
            <div className="w-full md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rulebook (URL or Text)</label>
              <textarea 
                name="rulebook"
                value={formData.rulebook}
                onChange={handleInputChange}
                required
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
                rows={2}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">Eligibility & Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Min Age (optional)" type="number" name="minAge" value={formData.minAge} onChange={handleInputChange} />
            <Input label="Max Age (optional)" type="number" name="maxAge" value={formData.maxAge} onChange={handleInputChange} />
            
            <Input label="Registration Start Date" type="datetime-local" name="registrationStartDate" value={formData.registrationStartDate} onChange={handleInputChange} required />
            <Input label="Registration End Date" type="datetime-local" name="registrationEndDate" value={formData.registrationEndDate} onChange={handleInputChange} required />
            
            <Input label="Competition Start Date" type="datetime-local" name="competitionStartDate" value={formData.competitionStartDate} onChange={handleInputChange} required />
            <Input label="Competition End Date" type="datetime-local" name="competitionEndDate" value={formData.competitionEndDate} onChange={handleInputChange} required />
            
            <Input label="Max Participants" type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleInputChange} required />
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Rounds</h2>
            <PrimaryButton type="button" variant="secondary" onClick={addRound}>
              <Plus className="w-4 h-4 mr-2" />
              Add Round
            </PrimaryButton>
          </div>

          <div className="space-y-8">
            {rounds.map((round, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-100 relative">
                {rounds.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeRound(index)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <h3 className="font-medium text-gray-900 mb-4">Round {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Round Name" value={round.name} onChange={e => handleRoundChange(index, 'name', e.target.value)} required />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select 
                      value={round.type}
                      onChange={e => handleRoundChange(index, 'type', e.target.value)}
                      className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
                    >
                      <option value="online">Online</option>
                      <option value="physical">Physical</option>
                    </select>
                  </div>
                  <Input label="Timer (mins)" type="number" value={round.timer} onChange={e => handleRoundChange(index, 'timer', e.target.value)} required />
                  
                  <Input label="Passing Score" type="number" value={round.passingScore} onChange={e => handleRoundChange(index, 'passingScore', e.target.value)} required />
                  <Input label="Qualifiers" type="number" value={round.numberOfQualifiers} onChange={e => handleRoundChange(index, 'numberOfQualifiers', e.target.value)} required />
                  <div />

                  <Input label="Start Date" type="datetime-local" value={round.startDate} onChange={e => handleRoundChange(index, 'startDate', e.target.value)} required />
                  <Input label="End Date" type="datetime-local" value={round.endDate} onChange={e => handleRoundChange(index, 'endDate', e.target.value)} required />
                  <div />

                  {round.type === 'physical' && (
                    <>
                      <Input label="Venue" value={round.venue} onChange={e => handleRoundChange(index, 'venue', e.target.value)} />
                      <Input label="Hall" value={round.hall} onChange={e => handleRoundChange(index, 'hall', e.target.value)} />
                      <Input label="Room" value={round.room} onChange={e => handleRoundChange(index, 'room', e.target.value)} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end gap-4">
          <Link href="/admin/competitions">
            <PrimaryButton type="button" variant="secondary">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </PrimaryButton>
          </Link>
          <PrimaryButton type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Create Competition'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
