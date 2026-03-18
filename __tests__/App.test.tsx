/**
 * @format
 */

import 'react-native';
import React from 'react';

// Simple smoke test - just ensure App can be imported without errors
describe('App', () => {
  it('should import without errors', () => {
    const App = require('../App').default;
    expect(App).toBeDefined();
  });
});
