'use client';

import { motion } from 'framer-motion';

interface Milestone {
  date: string;
  event: string;
  description?: string;
}

interface MissionMilestonesProps {
  missionId: string;
}

const milestones: Record<string, Milestone[]> = {
  'parker-solar-probe': [
    { date: 'Aug 12, 2018', event: 'Launch', description: 'Launched from Cape Canaveral on a Delta IV Heavy rocket' },
    { date: 'Oct 3, 2018', event: 'First Venus Flyby', description: 'Used Venus gravity assist to adjust orbit' },
    { date: 'Nov 6, 2018', event: 'First Perihelion', description: 'First close approach to the Sun at 35.7 solar radii' },
    { date: 'Apr 4, 2019', event: 'Second Perihelion', description: 'Closer approach at 35.7 solar radii' },
    { date: 'Dec 26, 2019', event: 'Second Venus Flyby', description: 'Another gravity assist to get closer to the Sun' },
    { date: 'Apr 28, 2021', event: 'Touched the Sun', description: 'First spacecraft to fly through the solar corona' },
    { date: 'Dec 14, 2021', event: 'Record Speed', description: 'Became fastest human-made object at 586,864 km/h' },
    { date: 'Nov 21, 2023', event: 'Record Approach', description: 'Closest approach yet at 7.26 million km from Sun' },
    { date: 'Dec 24, 2024', event: 'Final Close Approach', description: 'Will reach 6.9 million km from the Sun\'s surface' },
  ],
  'voyager-1': [
    { date: 'Sep 5, 1977', event: 'Launch', description: 'Launched from Cape Canaveral, Florida' },
    { date: 'Mar 5, 1979', event: 'Jupiter Encounter', description: 'Closest approach to Jupiter, discovered volcanic activity on Io' },
    { date: 'Nov 12, 1980', event: 'Saturn Encounter', description: 'Detailed study of Saturn, its rings, and moons' },
    { date: 'Feb 14, 1990', event: 'Pale Blue Dot', description: 'Took famous photo of Earth from 6 billion km away' },
    { date: 'Feb 17, 1998', event: 'Most Distant Spacecraft', description: 'Overtook Pioneer 10 as most distant human-made object' },
    { date: 'Dec 16, 2004', event: 'Termination Shock', description: 'Crossed the termination shock at 94 AU from Sun' },
    { date: 'Aug 25, 2012', event: 'Entered Interstellar Space', description: 'First human-made object to leave the heliosphere' },
    { date: 'Nov 28, 2017', event: 'Thrusters Reactivated', description: 'Fired backup thrusters for first time in 37 years' },
    { date: '2025 (Est)', event: 'Power Depletion', description: 'Expected to lose power for communications' },
  ],
  'voyager-2': [
    { date: 'Aug 20, 1977', event: 'Launch', description: 'Launched 16 days before Voyager 1' },
    { date: 'Jul 9, 1979', event: 'Jupiter Encounter', description: 'Discovered Jupiter\'s 14th moon and studied the Great Red Spot' },
    { date: 'Aug 25, 1981', event: 'Saturn Encounter', description: 'Detailed study of Saturn\'s rings and moons' },
    { date: 'Jan 24, 1986', event: 'Uranus Encounter', description: 'First and only spacecraft to visit Uranus' },
    { date: 'Aug 25, 1989', event: 'Neptune Encounter', description: 'First and only spacecraft to visit Neptune' },
    { date: 'Aug 30, 2007', event: 'Termination Shock', description: 'Crossed the termination shock at 84 AU' },
    { date: 'Nov 5, 2018', event: 'Entered Interstellar Space', description: 'Second human-made object to leave the heliosphere' },
    { date: 'Jul 21, 2020', event: 'DSN Upgrade', description: 'Contact restored after 8-month communication blackout' },
    { date: '2025 (Est)', event: 'Science Instrument Shutdown', description: 'Expected to begin shutting down instruments to conserve power' },
  ],
};

export function MissionMilestones({ missionId }: MissionMilestonesProps) {
  const missionMilestones = milestones[missionId];

  if (!missionMilestones) {
    return null;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Mission Timeline & Milestones</h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
        
        {/* Milestones */}
        <div className="space-y-6">
          {missionMilestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start"
            >
              {/* Timeline dot */}
              <div className="absolute left-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 z-10" />
              
              {/* Content */}
              <div className="ml-16">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-mono text-blue-400">{milestone.date}</span>
                  <h3 className="font-semibold text-white">{milestone.event}</h3>
                </div>
                {milestone.description && (
                  <p className="text-gray-400 text-sm">{milestone.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}