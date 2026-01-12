import { useState, useRef, DOMElement, InputHTMLAttributes } from 'react';
import FileButton from './FileButton';
import TextField from './TextField';
import InfoButton from './InfoButton';

import documentationTexts from '../documentationTexts.json';

// Following types are based on q8s-kernel from: https://github.com/qubernetes-dev/q8s-kernel/blob/26b2cf02a33f415e773095cd9f030b65e1b9f329/src/q8s/project.py#L80-L111
export type Q8SPythonEnv = {
  dependencies: string[];
};

export type Q8STarget = {
  python_env: Q8SPythonEnv;
};

export type Q8STargets = {
  cpu?: Q8STarget;
  gpu?: Q8STarget;
  qpu?: Q8STarget;
};

/**
 * Helper to get present target keys (cpu/gpu/qpu) from a Q8STargets object.
 */
export const getTargetKeys = (targets: Q8STargets) => {
  const keys = ['cpu', 'gpu', 'qpu'] as const;
  return keys.filter((k): k is (typeof keys)[number] => targets[k] != null);
};

export type Q8SDocker = {
  username: string;
  registry?: string;
};

export type Q8SProject = {
  name: string;
  pythonEnv: Q8SPythonEnv;
  targets: Q8STargets;
  docker: Q8SDocker;
  kubeconfig: string;
};

export interface ConfigurationViewProps {
  onClose: () => void;
}

/**
 * The configuration view.
 * Handles file and directory states and renders the configuration view.
 */
export default function ConfigurationView({ onClose }: ConfigurationViewProps) {
  const [q8sproject, setQ8sproject] = useState<Q8SProject>({
    name: '',
    pythonEnv: { dependencies: [] },
    targets: {},
    docker: { username: '' },
    kubeconfig: '',
  });

  const [kubeconfigName, setKubeconfigName] = useState('');
  const [kubeconfigPath, setKubeconfigPath] = useState('');
  const [directoryName, setDirectoryName] = useState('');
  const [directoryPath, setDirectoryPath] = useState('');
  const [configurationName, setConfigurationName] = useState('');
  const [error, setError] = useState('');
  const commandRef = useRef<string>('');

  const handleChange = (e) => {
    setQ8sproject({
      ...q8sproject,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Opens a dialog to select a file or directory.
   */
  const openDialog = async (isDirectory: boolean = false) => {
    const filePath = await window.electronAPI.openFile(isDirectory);
    if (filePath) {
      const regex = /\/|\\/;
      const pathArray = filePath.split(regex);
      const name = pathArray[pathArray.length - 1];
      if (isDirectory) {
        setDirectoryName(name);
        setDirectoryPath(filePath);
      } else {
        setKubeconfigName(name);
        setKubeconfigPath(filePath);
        if (!configurationName) {
          setConfigurationName(name);
        }
      }
    }
  };
  // Genetare the command to run when configuration file and workspace folder have been selected.
  if (kubeconfigPath && directoryPath) {
    commandRef.current = `docker run --rm --name q8studio -p 8888:8888 -v ${kubeconfigPath}:/home/jupyter/.kube/config -v ${directoryPath}:/workspace --pull always ghcr.io/torqs-project/q8s-devenv:main`;
  }
  return (
    <div>
      <h2 className="modal-title">
        {q8sproject.name ? q8sproject.name : 'New Q8SProject'}
      </h2>
      <div className="content">
        <div className="inputs">
          <TextField
            label="Name"
            fieldValue={q8sproject.name}
            autofocus
            inputName="name"
            handleChange={handleChange}
            documentationText={documentationTexts.name.full}
            shortDescription={documentationTexts.name.short}
            pattern="^/?([a-zA-Z0-9_ ]+)$" // Pattern to allow letters, spaces and underscores only
            validationMessage="Name can only contain letters from A-Z,spaces and underscores."
          />
          <TextField
            label="Python Dependencies"
            fieldValue={q8sproject.pythonEnv.dependencies.join(', ')}
            inputName="pythonDependencies"
            documentationText={documentationTexts.pythonEnv.full}
            shortDescription={documentationTexts.pythonEnv.short}
            handleChange={(e) => {
              setQ8sproject({
                ...q8sproject,
                pythonEnv: {
                  dependencies: e.target.value
                    .split(',')
                    .map((dep: string) => dep.trim()),
                },
              });
            }}
          />
          <TextField
            label="Docker Username"
            fieldValue={q8sproject.docker.username}
            inputName="docker"
            handleChange={(e) => {
              setQ8sproject({
                ...q8sproject,
                docker: {
                  username: e.target.value,
                },
              });
            }}
            documentationText={documentationTexts.dockerUsername.full}
            shortDescription={documentationTexts.dockerUsername.short}
            pattern="^/?([a-zA-Z0-9_ ]+)$" // Pattern to allow letters, spaces and underscores only
            validationMessage="Name can only contain letters from A-Z,spaces and underscores."
          />
          <div className="input-div">
            <label className="text-input" htmlFor="targets">
              <span>Target</span>
              <select name="targets" id="targets" onChange={handleChange}>
                <option value={q8sproject.targets.cpu ? 'cpu' : ''}>CPU</option>
                <option value={q8sproject.targets.gpu ? 'gpu' : ''}>GPU</option>
                <option value={q8sproject.targets.qpu ? 'qpu' : ''}>QPU</option>
              </select>
            </label>

            <InfoButton
              documentationText={documentationTexts.target.full}
              shortDescription={documentationTexts.target.short}
            />
          </div>

          <FileButton
            name={kubeconfigName}
            path={kubeconfigPath}
            openDialog={openDialog}
            documentationText={documentationTexts.kubernetesConfig.full}
            shortDescription={documentationTexts.kubernetesConfig.short}
          />
          <FileButton
            name={directoryName}
            path={directoryPath}
            isDirectory
            openDialog={openDialog}
            documentationText={documentationTexts.workspacePath.full}
            shortDescription={documentationTexts.workspacePath.short}
          />
        </div>
        <div className="project-preview">
          <h3>Q8SProject Preview</h3>
          <pre>{JSON.stringify(q8sproject, null, 2)}</pre>
        </div>
      </div>
      {commandRef.current && !error ? (
        <div className="file">
          <button
            type="button"
            className="save-button"
            onClick={() => {
              const objectToSave: Q8SProject = {
                name: configurationName,
                pythonEnv: q8sproject.pythonEnv,
                targets: q8sproject.targets,
                docker: q8sproject.docker,
                kubeconfig: kubeconfigPath,
              };
              window.electronAPI
                .writeFile(configurationName, objectToSave)
                .then((isSaved) => {
                  if (isSaved) {
                    onClose();
                    return isSaved;
                  }
                  throw new Error('Error saving file');
                })
                .catch((err) => {
                  // eslint-disable-next-line no-console
                  console.log(err);
                });
            }}
          >
            <svg
              width="30px"
              height="30px"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="white"
            >
              <path
                d="M3 19V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z"
                stroke="white"
                strokeWidth="1.7"
              />
              <path
                d="M8.6 9H15.4C15.7314 9 16 8.73137 16 8.4V3.6C16 3.26863 15.7314 3 15.4 3H8.6C8.26863 3 8 3.26863 8 3.6V8.4C8 8.73137 8.26863 9 8.6 9Z"
                stroke="white"
                strokeWidth="1.7"
              />
              <path
                d="M6 13.6V21H18V13.6C18 13.2686 17.7314 13 17.4 13H6.6C6.26863 13 6 13.2686 6 13.6Z"
                stroke="white"
                strokeWidth="1.7"
              />
            </svg>
            Save configuration
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
