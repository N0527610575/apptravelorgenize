import React from 'react';
import { TripProvider } from './src/presentation/state/TripContext';
import { MainCompanionScreen } from './src/presentation/screens/MainCompanionScreen';

export default function App() {
  return (
    <TripProvider>
      <MainCompanionScreen />
    </TripProvider>
  );
}
