import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { User, Edit2, Save, X, Heart, Ruler, Scale, Calendar } from 'lucide-react';

export default function ProfileSettings() {
  const { userProfile, healthConditions, customConditions, setUserProfile, resetApp } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
    weight: userProfile?.weight?.toString() || '',
    height: userProfile?.height?.toString() || '',
    age: userProfile?.age?.toString() || '',
  });

  const calculateBMI = () => {
    if (!userProfile) return { bmi: 0, category: '' };
    
    const heightInMeters = userProfile.height / 100;
    const bmi = userProfile.weight / (heightInMeters * heightInMeters);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    
    return { bmi: bmi.toFixed(1), category };
  };

  const { bmi, category } = calculateBMI();

  const handleSave = () => {
    if (userProfile && formData.username && formData.weight && formData.height && formData.age) {
      setUserProfile({
        username: formData.username,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: userProfile?.username || '',
      weight: userProfile?.weight?.toString() || '',
      height: userProfile?.height?.toString() || '',
      age: userProfile?.age?.toString() || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text">Profile</h1>
          <p className="text-text-secondary text-sm">Manage your settings</p>
        </div>
        
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-secondary p-2">
            <Edit2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="btn-secondary p-2">
              <X className="w-5 h-5" />
            </button>
            <button onClick={handleSave} className="btn-primary p-2">
              <Save className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Profile Info Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field text-lg font-semibold"
              />
            ) : (
              <h2 className="text-xl font-bold">{userProfile?.username}</h2>
            )}
            <p className="text-text-secondary text-sm">Fitness Enthusiast</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-surface rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Scale className="w-4 h-4" />
              <span className="text-xs">Weight</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field text-lg font-semibold"
              />
            ) : (
              <p className="text-2xl font-bold">{userProfile?.weight} kg</p>
            )}
          </div>

          <div className="bg-bg-surface rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Ruler className="w-4 h-4" />
              <span className="text-xs">Height</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input-field text-lg font-semibold"
              />
            ) : (
              <p className="text-2xl font-bold">{userProfile?.height} cm</p>
            )}
          </div>

          <div className="bg-bg-surface rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Age</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field text-lg font-semibold"
              />
            ) : (
              <p className="text-2xl font-bold">{userProfile?.age} years</p>
            )}
          </div>

          <div className="bg-bg-surface rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-muted mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs">BMI</span>
            </div>
            <p className="text-2xl font-bold">{bmi}</p>
            <p className={`text-xs ${
              category === 'Normal weight' ? 'text-success' :
              category === 'Underweight' ? 'text-warning' :
              'text-red-400'
            }`}>
              {category}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Health Conditions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="font-semibold mb-4">Health Conditions</h3>
        
        {healthConditions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {healthConditions.map((condition) => (
              <span key={condition.id} className="badge badge-primary">
                {condition.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm">No health conditions selected</p>
        )}

        {customConditions.length > 0 && (
          <>
            <h4 className="font-medium mt-4 mb-2 text-sm text-text-secondary">Custom Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {customConditions.map((name) => (
                <span key={name} className="badge badge-warning">
                  {name}
                </span>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* App Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center py-8"
      >
        <p className="text-text-muted text-sm mb-2">AI Fitness & Health App</p>
        <p className="text-text-muted text-xs">Version 1.0.0</p>
        
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to reset all data?')) {
              resetApp();
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="mt-4 text-red-400 text-sm hover:text-red-300"
        >
          Reset All Data
        </button>
      </motion.div>
    </div>
  );
}
