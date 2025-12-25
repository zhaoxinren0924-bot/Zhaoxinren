
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { PersonalityTraits } from '../types';

interface PersonalityChartProps {
  traits: PersonalityTraits;
}

const PersonalityChart: React.FC<PersonalityChartProps> = ({ traits }) => {
  const data = [
    { subject: 'Playful', A: traits.playfulness, fullMark: 100 },
    { subject: 'Wise', A: traits.wisdom, fullMark: 100 },
    { subject: 'Loyal', A: traits.loyalty, fullMark: 100 },
    { subject: 'Curious', A: traits.curiosity, fullMark: 100 },
    { subject: 'Calm', A: traits.calmness, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Radar
            name="Personality"
            dataKey="A"
            stroke="#111827"
            fill="#111827"
            fillOpacity={0.1}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PersonalityChart;
