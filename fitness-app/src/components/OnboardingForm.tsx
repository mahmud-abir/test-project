import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { generateHabits } from '../utils/habitGenerator';
import { getAllConditions, getConditionById } from '../utils/habitGenerator';
import { Watch, Check, Plus, X, Search } from 'lucide-react';

type OnboardingStep = 'profile' | 'conditions' | 'watch' | 'completion';

export default function OnboardingForm() {
  const { 
    onboardingStep, 
    setOnboardingStep, 
    setUserProfile, 
    addHealthCondition, 
    removeHealthCondition,
    addCustomCondition,
    removeCustomCondition,
    healthConditions,
    customConditions,
    connectWatch,
  } = useAppStore();

  // Profile state
  const [username, setUsername] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  // Conditions search
  const [searchTerm, setSearchTerm] = useState('');
  const [customInput, setCustomInput] = useState('');

  // Watch connection
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const allConditions = getAllConditions();
  const filteredConditions = allConditions.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !weight || !height || !age) return;

    setUserProfile({
      username,
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
    });
    setOnboardingStep('conditions');
  };

  const handleAddCondition = (condition: typeof allConditions[0]) => {
    if (!healthConditions.find(c => c.id === condition.id)) {
      addHealthCondition(condition);
    }
  };

  const handleAddCustomCondition = () => {
    if (customInput.trim() && !customConditions.includes(customInput.trim())) {
      addCustomCondition(customInput.trim());
      setCustomInput('');
    }
  };

  const handleConditionsComplete = () => {
    setOnboardingStep('watch');
  };

  const handleWatchConnect = () => {
    if (selectedDevice) {
      connectWatch(selectedDevice, false);
      setOnboardingStep('completion');
    }
  };

  const renderProgressBar = () => {
    const steps: OnboardingStep[] = ['profile', 'conditions', 'watch', 'completion'];
    const currentIndex = steps.indexOf(onboardingStep);

    return (
      <div className="flex gap-2 mb-8">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= currentIndex ? 'bg-primary' : 'bg-bg-card'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderProfileStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold gradient-text mb-2">Let's Get Started!</h2>
        <p className="text-text-secondary">Tell us about yourself to personalize your experience</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-xl bg-bg-surface border border-bg-card focus:border-primary focus:outline-none transition-colors"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-surface border border-bg-card focus:border-primary focus:outline-none transition-colors"
              placeholder="70"
              min="30"
              max="200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-surface border border-bg-card focus:border-primary focus:outline-none transition-colors"
              placeholder="175"
              min="100"
              max="220"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 rounded-xl bg-bg-surface border border-bg-card focus:border-primary focus:outline-none transition-colors"
            placeholder="25"
            min="10"
            max="100"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full mt-6">
          Continue
        </button>
      </form>
    </motion.div>
  );

  const renderConditionsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Health Conditions</h2>
        <p className="text-text-secondary">Select any conditions that apply to you</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-surface border border-bg-card focus:border-primary focus:outline-none transition-colors"
          placeholder="Search conditions..."
        />
      </div>

      {/* Selected conditions */}
      {(healthConditions.length > 0 || customConditions.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {healthConditions.map((condition) => (
            <span
              key={condition.id}
              className="badge badge-primary flex items-center gap-1"
            >
              {condition.name}
              <button onClick={() => removeHealthCondition(condition.id)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {customConditions.map((condition) => (
            <span
              key={condition}
              className="badge badge-success flex items-center gap-1"
            >
              {condition}
              <button onClick={() => removeCustomCondition(condition)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Condition list */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredConditions.map((condition) => {
          const isSelected = healthConditions.find(c => c.id === condition.id);
          return (
            <button
              key={condition.id}
              onClick={() => handleAddCondition(condition)}
              disabled={isSelected}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-primary/20 border-primary opacity-50'
                  : 'bg-bg-surface border-bg-card hover:border-primary/50'
              } border`}
            >
              <div className="flex items-center justify-between">
                <span>{condition.name}</span>
                {isSelected && <Check className="w-5 h-5 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom condition */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCondition()}
          className="flex-1 p-3 rounded-xl bg-bg-surface border border-bg-card focus:border-primary focus:outline-none transition-colors"
          placeholder="Add custom condition..."
        />
        <button
          onClick={handleAddCustomCondition}
          className="btn-secondary px-4"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <button onClick={handleConditionsComplete} className="btn-primary w-full">
        Continue
      </button>
    </motion.div>
  );

  const simulationDevices = [
    { name: 'FitWatch Pro', type: 'smartwatch' },
    { name: 'Black Shark GT3 Neo', type: 'smartwatch' },
    { name: 'Polar H10', type: 'heart-rate-monitor' },
    { name: 'Garmin Venu', type: 'smartwatch' },
  ];

  const renderWatchStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Connect Your Watch</h2>
        <p className="text-text-secondary">Sync with your smartwatch for real-time tracking</p>
      </div>

      {/* Animated watch illustration */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"
        >
          <Watch className="w-16 h-16 text-primary" />
        </motion.div>
      </div>

      {/* Device list */}
      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Available Devices</h3>
        {simulationDevices.map((device) => (
          <button
            key={device.name}
            onClick={() => setSelectedDevice(device.name)}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedDevice === device.name
                ? 'bg-primary/20 border-primary'
                : 'bg-bg-surface border-bg-card hover:border-primary/50'
            } border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{device.name}</p>
                <p className="text-sm text-text-muted capitalize">{device.type}</p>
              </div>
              {selectedDevice === device.name && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleWatchConnect}
        disabled={!selectedDevice}
        className={`btn-primary w-full ${!selectedDevice ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Connect & Continue
      </button>

      <button
        onClick={() => setOnboardingStep('completion')}
        className="btn-secondary w-full"
      >
        Skip for Now
      </button>
    </motion.div>
  );

  const renderCompletionStep = () => {
    const profile = useAppStore.getState().userProfile;
    const habits = generateHabits(
      profile!,
      healthConditions,
      customConditions
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4"
          >
            <Check className="w-12 h-12 text-success" />
          </motion.div>
          <h2 className="text-2xl font-bold gradient-text mb-2">You're All Set!</h2>
          <p className="text-text-secondary">Welcome to your fitness journey, {profile?.username}!</p>
        </div>

        <div className="card text-left">
          <h3 className="font-semibold mb-4">Your Personalized Habits ({habits.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {habits.slice(0, 5).map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 p-2 rounded-lg bg-bg-surface">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${habit.color}20` }}
                >
                  <span className="text-sm">{habit.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{habit.name}</p>
                  <p className="text-xs text-text-muted">
                    {habit.intervalMinutes ? `Every ${habit.intervalMinutes}min` : habit.scheduledTime}
                  </p>
                </div>
              </div>
            ))}
            {habits.length > 5 && (
              <p className="text-xs text-text-muted text-center pt-2">
                +{habits.length - 5} more habits
              </p>
            )}
          </div>
        </div>

        {healthConditions.length > 0 && (
          <div className="card text-left">
            <h3 className="font-semibold mb-2">Health Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {healthConditions.map((c) => (
                <span key={c.id} className="badge badge-primary text-xs">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            const generatedHabits = generateHabits(profile!, healthConditions, customConditions);
            useAppStore.getState().setHabits(generatedHabits);
            useAppStore.getState().setOnboarded(true);
          }}
          className="btn-primary w-full mt-6"
        >
          Start Your Journey
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderProgressBar()}
        
        <div className="card">
          {onboardingStep === 'profile' && renderProfileStep()}
          {onboardingStep === 'conditions' && renderConditionsStep()}
          {onboardingStep === 'watch' && renderWatchStep()}
          {onboardingStep === 'completion' && renderCompletionStep()}
        </div>
      </div>
    </div>
  );
}
