/* eslint-disable no-console */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import runIcon from '../../../assets/icons/run.svg';
import deleteIcon from '../../../assets/icons/delete.svg';
import { Q8SProject } from './ConfigurationView';
import { useAppNavigation } from '../contexts/ConsoleContext';
import { useModal } from '../contexts/ModalContext';

export interface ConfigurationTileProps {
  config: Q8SProject;
  refreshConfigsList: () => Promise<void>;
}
/**
 * A tile that shows the saved environment configuration.
 */
export default function ConfigurationTile({
  config,
  refreshConfigsList,
}: ConfigurationTileProps): React.JSX.Element {
  const { name: projectName } = config;
  const { setNavState, setEnvName } = useAppNavigation();
  const navigate = useNavigate();
  const { setShowModal, setConfigToEdit } = useModal();
  return (
    <div className="tile-div">
      <button
        className="tile-btn"
        type="button"
        onClick={async () => {
          const portToUse = await window.electronAPI
            .getPort()
            .then((newportToUse) => {
              return newportToUse;
            })
            .catch((err) => {
              console.log(err);
              return 0;
            });
          navigate('/clg');
          setNavState('environment');
          setEnvName(projectName);
          window.electronAPI
            .runDockerCommand(config, portToUse.toString())
            .then((result: any) => {
              return result;
            })
            .catch(() => {});
        }}
      >
        <span> {projectName}</span> <img src={runIcon} alt="" />
      </button>
      <button
        className="edit-btn"
        type="button"
        onClick={() => {
          setShowModal('config');
          setConfigToEdit?.(config);
        }}
      >
        <span>edit</span>
      </button>
      <button
        className="del-btn"
        type="button"
        onClick={() => {
          window.electronAPI
            .deleteFile(projectName)
            .then((result) => {
              // TODO: refresh list
              refreshConfigsList();
              return result;
            })
            .catch(() => {
              // console.log(err);
            });
        }}
      >
        {' '}
        <img src={deleteIcon} alt="" />{' '}
      </button>
    </div>
  );
}
