import React, { useState, useEffect } from 'react';
import ConfigurationTile from './ConfigurationTile';
import { Q8SProject } from './ConfigurationView';

export interface ConfigListProps {
  children: React.JSX.Element;
  refresh: boolean;
}

function ConfigurationsList({ children, refresh }: ConfigListProps) {
  const [configurations, setConfigurations] = useState<Q8SProject[]>([]);
  const [error, setError] = useState<string>('');

  const loadFiles = async () => {
    try {
      const result = await window.electronAPI.loadFiles();
      setConfigurations(result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadFiles();
        await window.electronAPI.checkDocker();
        await window.electronAPI.checkQ8SCtl();
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [refresh]);

  return (
    <div className="conf-list-container">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5em' }}>
        {configurations.length > 0
          ? 'Start an environment:'
          : 'Create a new configuration:'}
      </h2>
      <div className="conf-list">
        {configurations.map((config: Q8SProject) => (
          <ConfigurationTile
            config={config}
            key={config.name}
            refreshConfigsList={loadFiles}
          />
        ))}
        {/* <ConfigurationTile configName="kubernetes" kubePath="" workspacePath="" />
      <ConfigurationTile configName="kubernetes" kubePath="" workspacePath="" /> */}
        {children}
      </div>
    </div>
  );
}

export default ConfigurationsList;
