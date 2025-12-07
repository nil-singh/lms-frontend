"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import AdminHeader from "@/components/AdminHeader";

type Q = {
  _id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
  weight: number;
  category?: string;
  createdAt?: string;
};

export default function QuestionsAdmin() {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Q | null>(null);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const initialForm: Q = {
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    difficulty: 5,
    weight: 1,
    category: "",
  };

  const [form, setForm] = useState<Q>(initialForm);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/questions");
      setQuestions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      if (editing && editing._id) {
        await api.put(`/questions/${editing._id}`, form);
      } else {
        await api.post("/questions", form);
      }

      setForm(initialForm);
      setEditing(null);
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    }
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/questions/${id}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function startEdit(q: Q) {
    setEditing(q);
    setForm({
      text: q.text,
      options: q.options.slice(),
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      weight: q.weight,
      category: q.category || "",
    });
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase()) ||
                         q.category?.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === "all" || 
                             q.difficulty === parseInt(filterDifficulty);
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return "bg-green-100 text-green-800";
    if (difficulty <= 6) return "bg-yellow-100 text-yellow-800";
    if (difficulty <= 8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

           {/* Header/Navigation */}
              <AdminHeader />
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
              <p className="text-gray-600 mt-2">Manage and organize all test questions</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">
                Total: {questions.length} questions
              </span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                {[1,2,3,4,5,6,7,8,9,10].map(d => (
                  <option key={d} value={d}>Difficulty: {d}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setFilterDifficulty("all");
                  setSearch("");
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiFilter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FiPlus />
                  {editing ? "Edit Question" : "Create New Question"}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your question here..."
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mathematics, Science, History"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>

                {/* Options Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer Options
                    </label>
                    <span className="text-sm text-gray-500">
                      Select correct answer
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.options.map((option, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, correctIndex: index })}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              form.correctIndex === index 
                                ? 'border-green-500 bg-green-500' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {form.correctIndex === index && (
                              <FiCheck className="text-white w-3 h-3" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <input
                              type="text"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => {
                                const arr = [...form.options];
                                arr[index] = e.target.value;
                                setForm({ ...form, options: arr });
                              }}
                            />
                          </div>
                        </div>
                        
                        {form.correctIndex === index && (
                          <div className="absolute -top-2 right-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Correct
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuration Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Option
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">
                        {form.correctIndex + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        (0-3)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={form.correctIndex}
                      onChange={(e) => setForm({ ...form, correctIndex: Number(e.target.value) })}
                      className="w-full mt-3"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(form.difficulty)}`}>
                        Level {form.difficulty}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {form.difficulty}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                      className="w-full mt-3"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{form.weight}</span>
                        </div>
                        <span className="text-sm text-gray-500">points</span>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setForm({ ...form, weight: w })}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                              form.weight === w 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={save}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FiCheck size={20} />
                    {editing ? "Update Question" : "Create Question"}
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditing(null);
                      setForm(initialForm);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiX size={20} />
                    Clear Form
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Questions List */}
          <div className="space-y-6">
            {/* List Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                All Questions ({filteredQuestions.length})
              </h3>
              {editing && (
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                  <FiEdit2 size={16} />
                  Editing Question
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading questions...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="text-gray-400" size={24} />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No questions found</h4>
                  <p className="text-gray-600 mb-4">
                    {search ? "Try adjusting your search or filter" : "Create your first question to get started"}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q._id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {q.category && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                {q.category}
                              </span>
                            )}
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(q.difficulty)}`}>
                              Difficulty {q.difficulty}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                              Weight: {q.weight}
                            </span>
                          </div>
                          
                          <p className="text-gray-900 font-medium mb-4 line-clamp-2">
                            {q.text}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((option, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  idx === q.correctIndex
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                    idx === q.correctIndex
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className={`text-sm ${
                                    idx === q.correctIndex ? 'text-green-700 font-medium' : 'text-gray-600'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          Correct answer: <span className="font-medium text-green-600">
                            Option {String.fromCharCode(65 + q.correctIndex)}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(q)}
                            className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <FiEdit2 size={18} />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => remove(q._id)}
                            className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <FiTrash2 size={18} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}