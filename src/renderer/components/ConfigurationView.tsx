import { useState, useRef, useEffect } from 'react';
import yaml from 'js-yaml';
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
  python_env: Q8SPythonEnv;
  targets: Q8STargets;
  docker: Q8SDocker;
  kubeconfig: string;
  workspacePath: string;
};

export interface ConfigurationViewProps {
  onClose: () => void;
  configToEdit: Q8SProject | undefined;
}

/**
 * The configuration view.
 * Handles file and directory states and renders the configuration view.
 */
export default function ConfigurationView({
  onClose,
  configToEdit,
}: ConfigurationViewProps) {
  const [q8sproject, setQ8sproject] = useState<Q8SProject>({
    name: '',
    python_env: { dependencies: [] },
    targets: {},
    docker: { username: '' },
    kubeconfig: '',
    workspacePath: '',
  });

  const [kubeconfigName, setKubeconfigName] = useState('');
  const [directoryName, setDirectoryName] = useState('');
  const [error, setError] = useState('');
  const commandRef = useRef<string>('');

  useEffect(() => {
    if (configToEdit) {
      setQ8sproject(configToEdit);
    }
  }, [configToEdit]);

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
        setQ8sproject({
          ...q8sproject,
          workspacePath: filePath,
        });
        setDirectoryName(name);
      } else {
        setQ8sproject({
          ...q8sproject,
          kubeconfig: filePath,
        });
        setKubeconfigName(name);
        if (!q8sproject.name) {
          setKubeconfigName(name);
          setQ8sproject({
            ...q8sproject,
            name,
          });
        }
      }
    }
  };
  // Generate the command to run when configuration file and workspace folder have been selected.
  if (q8sproject.kubeconfig && q8sproject.workspacePath) {
    commandRef.current = `docker run --rm --name q8studio -p 8888:8888 -v ${q8sproject.kubeconfig}:/home/jupyter/.kube/config -v ${q8sproject.workspacePath}:/workspace --pull always ghcr.io/torqs-project/q8s-devenv:main`;
  }
  return (
    <div>
      <h2 className="modal-title">
        {q8sproject.name ? q8sproject.name : 'New Q8SProject'}
      </h2>
      <div className="content">
        <div className="conf-view">
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
              fieldValue={q8sproject.python_env.dependencies.join(', ')}
              inputName="pythonDependencies"
              documentationText={documentationTexts.pythonEnv.full}
              shortDescription={documentationTexts.pythonEnv.short}
              handleChange={(e) => {
                setQ8sproject({
                  ...q8sproject,
                  python_env: {
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
            <TextField
              label="CPU Python Dependencies"
              fieldValue={
                q8sproject.targets.cpu?.python_env?.dependencies?.join(', ') ||
                ''
              }
              inputName="CPUpythonDependencies"
              documentationText={documentationTexts.pythonEnv.full}
              shortDescription={documentationTexts.pythonEnv.short}
              handleChange={(e) => {
                setQ8sproject({
                  ...q8sproject,
                  targets: {
                    ...q8sproject.targets,
                    cpu: {
                      ...q8sproject.targets.cpu,
                      python_env: {
                        dependencies: e.target.value
                          .split(',')
                          .map((dep: string) => dep.trim()),
                      },
                    },
                  },
                });
              }}
            />

            <TextField
              label="GPU Python Dependencies"
              fieldValue={
                q8sproject.targets.gpu?.python_env?.dependencies?.join(', ') ||
                ''
              }
              inputName="GPUpythonDependencies"
              documentationText={documentationTexts.pythonEnv.full}
              shortDescription={documentationTexts.pythonEnv.short}
              handleChange={(e) => {
                setQ8sproject({
                  ...q8sproject,
                  targets: {
                    ...q8sproject.targets,
                    gpu: {
                      ...q8sproject.targets.gpu,
                      python_env: {
                        dependencies: e.target.value
                          .split(',')
                          .map((dep: string) => dep.trim()),
                      },
                    },
                  },
                });
              }}
            />

            <FileButton
              name={kubeconfigName}
              path={q8sproject.kubeconfig}
              openDialog={openDialog}
              documentationText={documentationTexts.kubernetesConfig.full}
              shortDescription={documentationTexts.kubernetesConfig.short}
            />
            <FileButton
              name={directoryName}
              path={q8sproject.workspacePath}
              isDirectory
              openDialog={openDialog}
              documentationText={documentationTexts.workspacePath.full}
              shortDescription={documentationTexts.workspacePath.short}
            />
          </div>
          <div className="project-preview">
            <h3>Q8SProject Preview</h3>
            <pre>{yaml.dump(q8sproject)}</pre>
          </div>
        </div>

        {commandRef.current && !error ? (
          <button
            type="button"
            className="save-button"
            onClick={async () => {
              try {
                const objectToSave: Q8SProject = {
                  name: q8sproject.name,
                  python_env: q8sproject.python_env,
                  targets: q8sproject.targets,
                  docker: q8sproject.docker,
                  kubeconfig: q8sproject.kubeconfig,
                  workspacePath: q8sproject.workspacePath,
                };

                // Step 1: Rename
                if (configToEdit) {
                  const isRenamed = await window.electronAPI.renameFile(
                    configToEdit.name,
                    q8sproject.name,
                  );
                  if (!isRenamed)
                    throw new Error('Failed to rename configuration');
                }

                // Step 2: Write to appData
                const isSaved = await window.electronAPI.writeFile(
                  q8sproject.name,
                  objectToSave,
                );
                if (!isSaved) throw new Error('Failed to save configuration');

                // Step 3: Write to workspace
                try {
                  await window.electronAPI.saveQ8SProjectFile(
                    q8sproject.workspacePath,
                    q8sproject.name,
                    objectToSave,
                  );
                } catch (workspaceErr: any) {
                  setError(
                    `Failed to save to workspace: ${workspaceErr.message}`,
                  );
                  return; // Don't close modal if workspace save fails
                }

                onClose();
              } catch (err) {
                console.error('Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
              }
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
        ) : (
          <button
            type="button"
            disabled
            className="save-button-disabled"
            onClick={() => {
              const objectToSave: Q8SProject = {
                name: q8sproject.name,
                python_env: q8sproject.python_env,
                targets: q8sproject.targets,
                docker: q8sproject.docker,
                kubeconfig: q8sproject.kubeconfig,
                workspacePath: q8sproject.workspacePath,
              };
              if (configToEdit) {
                window.electronAPI
                  .renameFile(configToEdit?.name, q8sproject.name)
                  .then((isRenamed) => {
                    if (isRenamed) {
                      return isRenamed;
                    }
                    throw new Error('Error renaming file');
                  })
                  .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.log(err);
                  });
              }
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
        )}
      </div>
    </div>
  );
}
