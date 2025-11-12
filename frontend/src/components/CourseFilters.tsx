'use client';

import { useState } from 'react';
import { CourseFilters as Filters } from '@/types/course';

interface CourseFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export default function CourseFilters({ onFilterChange }: CourseFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      category: category || undefined,
      difficulty: difficulty || undefined,
      education_level: educationLevel || undefined
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setEducationLevel('');
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-300 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cari Kursus
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau deskripsi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Matematika">Matematika</option>
            <option value="Fisika">Fisika</option>
            <option value="Kimia">Kimia</option>
            <option value="Biologi">Biologi</option>
            <option value="Bahasa Inggris">Bahasa Inggris</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="Sejarah">Sejarah</option>
            <option value="Geografi">Geografi</option>
            <option value="Ekonomi">Ekonomi</option>
            <option value="Programming">Programming</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tingkat Kesulitan
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Level</option>
            <option value="beginner">Pemula</option>
            <option value="intermediate">Menengah</option>
            <option value="advanced">Mahir</option>
          </select>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenjang
          </label>
          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="Kuliah">Kuliah</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Terapkan Filter
        </button>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

